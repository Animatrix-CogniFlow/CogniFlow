from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from app.core.firebase_auth import get_current_user, get_firestore_client
from app.agents.oral_exam_agent import (
    transcribe_audio,
    generate_oral_questions,
    evaluate_oral_answer
)
from app.agents.language_agent import validate_language
from app.agents.persona_agent import validate_persona
import datetime

router = APIRouter()
db = get_firestore_client()


@router.post("/start/{document_id}")
async def start_oral_exam(
    document_id: str,
    count: int = Query(default=5, ge=1, le=10),
    language_code: str = Query(default="en"),
    persona: str = Query(default="university"),
    user: dict = Depends(get_current_user)
):
    """
    Starts an oral exam session for a document.
    persona adjusts how questions are asked and how feedback is given.
    """
    if not validate_language(language_code):
        raise HTTPException(status_code=400, detail=f"Unsupported language code: {language_code}")

    if not validate_persona(persona):
        raise HTTPException(status_code=400, detail=f"Invalid persona. Choose from: kid, secondary, university, casual")

    doc_ref = db.collection("documents").document(document_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    data = doc.to_dict()

    if data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    questions = await generate_oral_questions(
        raw_text=data["raw_text"],
        subject=data["subject"],
        count=count,
        output_language_code=language_code,
        persona=persona
    )

    exam_ref = db.collection("oral_exams").document()
    exam_ref.set({
        "user_id": user["uid"],
        "document_id": document_id,
        "title": data["title"],
        "subject": data["subject"],
        "language_code": language_code,
        "persona": persona,
        "questions": questions,
        "answers": [],
        "current_question": 0,
        "completed": False,
        "created_at": datetime.datetime.utcnow().isoformat()
    })

    return {
        "exam_id": exam_ref.id,
        "title": data["title"],
        "language_code": language_code,
        "persona": persona,
        "total_questions": len(questions),
        "first_question": questions[0]
    }


@router.post("/answer/{exam_id}")
async def submit_oral_answer(
    exam_id: str,
    audio: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    """
    Student records their spoken answer and submits the audio file.
    - Gemini transcribes audio for weak African languages
    - Whisper transcribes audio for all other languages
    - Gemini evaluates the transcribed answer in the persona tone
    """
    exam_ref = db.collection("oral_exams").document(exam_id)
    exam = exam_ref.get()

    if not exam.exists:
        raise HTTPException(status_code=404, detail="Exam not found")

    exam_data = exam.to_dict()

    if exam_data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if exam_data["completed"]:
        raise HTTPException(status_code=400, detail="This exam is already completed")

    current_index = exam_data["current_question"]
    questions = exam_data["questions"]
    current_question = questions[current_index]
    language_code = exam_data.get("language_code", "en")
    persona = exam_data.get("persona", "university")

    audio_bytes = await audio.read()
    transcription = await transcribe_audio(audio_bytes, audio.filename, language_code)

    evaluation = await evaluate_oral_answer(
        question=current_question["question"],
        key_points=current_question["key_points"],
        student_answer=transcription,
        subject=exam_data["subject"],
        output_language_code=language_code,
        persona=persona
    )

    answer_record = {
        "question_id": current_question["id"],
        "question": current_question["question"],
        "transcription": transcription,
        "evaluation": evaluation
    }

    answers = exam_data.get("answers", [])
    answers.append(answer_record)

    next_index = current_index + 1
    is_last = next_index >= len(questions)

    exam_ref.update({
        "answers": answers,
        "current_question": next_index,
        "completed": is_last,
        "completed_at": datetime.datetime.utcnow().isoformat() if is_last else None
    })

    response = {
        "transcription": transcription,
        "evaluation": evaluation,
        "is_complete": is_last
    }

    if not is_last:
        response["next_question"] = questions[next_index]
    else:
        total_score = sum(a["evaluation"]["score"] for a in answers)
        avg_score = round(total_score / len(answers), 1)

        if avg_score >= 8:
            overall = "Excellent performance. You have a strong grasp of this subject."
        elif avg_score >= 6:
            overall = "Good effort. Review the concepts you struggled with and try again."
        else:
            overall = "Keep studying. Focus on the missed key points in each question."

        response["overall_score"] = avg_score
        response["overall_feedback"] = overall

    return response


@router.get("/results/{exam_id}")
async def get_exam_results(
    exam_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Returns the full results of a completed oral exam.
    """
    exam_ref = db.collection("oral_exams").document(exam_id)
    exam = exam_ref.get()

    if not exam.exists:
        raise HTTPException(status_code=404, detail="Exam not found")

    exam_data = exam.to_dict()

    if exam_data["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if not exam_data["completed"]:
        raise HTTPException(status_code=400, detail="Exam is not completed yet")

    answers = exam_data["answers"]
    avg_score = round(sum(a["evaluation"]["score"] for a in answers) / len(answers), 1)

    return {
        "exam_id": exam_id,
        "title": exam_data["title"],
        "subject": exam_data["subject"],
        "language_code": exam_data.get("language_code", "en"),
        "persona": exam_data.get("persona", "university"),
        "total_questions": len(exam_data["questions"]),
        "average_score": avg_score,
        "answers": answers,
        "completed_at": exam_data.get("completed_at")
    }
