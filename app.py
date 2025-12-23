from __future__ import annotations

import datetime
import sqlite3
from pathlib import Path
from typing import Dict, List

from flask import Flask, jsonify, render_template, request, g

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "cyber_evolve.db"

app = Flask(__name__)


def get_db() -> sqlite3.Connection:
    """Return a per-request SQLite connection."""
    if "db" not in g:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        g.db = conn
    return g.db  # type: ignore[return-value]


@app.teardown_appcontext
def close_db(_: object) -> None:
    db: sqlite3.Connection | None = g.pop("db", None)  # type: ignore[assignment]
    if db is not None:
        db.close()


def seed_data(conn: sqlite3.Connection) -> None:
    """Insert starter quiz questions and tips when the database is empty."""
    existing_questions = conn.execute("SELECT COUNT(1) FROM questions").fetchone()[0]
    if not existing_questions:
        questions = [
            (
                "What is the most secure way to manage multiple passwords?",
                "Use a reputable password manager",
                "Write them on sticky notes near your desk",
                "Reuse a strong password on every site",
                "Email them to yourself for easy access",
                "A",
                "Password managers create unique, strong passwords and store them safely.",
            ),
            (
                "You receive an email asking you to reset your bank password through a link. What should you do?",
                "Click the link and reset immediately",
                "Ignore it and delete the email",
                "Manually type the bank URL in your browser to verify",
                "Forward the email to friends for awareness",
                "C",
                "Always navigate directly to the official site rather than trusting links in unsolicited emails.",
            ),
            (
                "Which of these is a sign of a phishing message?",
                "Generic greeting and urgent tone",
                "Professional grammar and correct spelling",
                "Sent from your own email address",
                "Arrives during business hours only",
                "A",
                "Phishing often uses urgency and generic greetings to push quick action.",
            ),
            (
                "What is a safe approach to public Wi‑Fi?",
                "Access sensitive accounts without worry",
                "Use a VPN or wait until on a trusted network",
                "Disable device updates to stay private",
                "Share the network password with strangers",
                "B",
                "A VPN protects your traffic on untrusted networks.",
            ),
            (
                "How often should you update your devices and apps?",
                "Only when performance slows",
                "Never—updates can break things",
                "Regularly, to patch security vulnerabilities",
                "Once every five years",
                "C",
                "Updates include security fixes that reduce risk from known issues.",
            ),
        ]
        conn.executemany(
            """
            INSERT INTO questions
            (question, option_a, option_b, option_c, option_d, correct_option, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            questions,
        )

    existing_tips = conn.execute("SELECT COUNT(1) FROM tips").fetchone()[0]
    if not existing_tips:
        tips = [
            ("Enable multi-factor authentication everywhere you can.",),
            ("Use long passphrases instead of short complex passwords.",),
            ("Update software promptly to patch security vulnerabilities.",),
            ("Be skeptical of unexpected attachments or links—even from people you know.",),
            ("Back up important files to both cloud and offline storage.",),
            ("Lock your devices when you step away, even for a minute.",),
            ("Review app permissions and remove what you do not need.",),
        ]
        conn.executemany("INSERT INTO tips (tip) VALUES (?)", tips)
    conn.commit()


def init_db() -> None:
    DB_PATH.touch(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_option TEXT NOT NULL CHECK (correct_option IN ('A','B','C','D')),
            explanation TEXT
        );
        CREATE TABLE IF NOT EXISTS tips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tip TEXT NOT NULL
        );
        """
    )
    seed_data(conn)
    conn.close()


@app.route("/")
def home() -> str:
    return render_template("home.html")


@app.route("/learn")
def learn() -> str:
    return render_template("learn.html")


@app.route("/quiz")
def quiz() -> str:
    return render_template("quiz.html")


@app.route("/daily-tip")
def daily_tip() -> str:
    return render_template("daily_tip.html")


@app.route("/api/quiz/questions")
def get_questions() -> tuple:
    db = get_db()
    rows = db.execute(
        """
        SELECT id, question, option_a, option_b, option_c, option_d, correct_option, explanation
        FROM questions
        ORDER BY id
        """
    ).fetchall()
    questions: List[Dict[str, str]] = []
    for row in rows:
        questions.append(
            {
                "id": row["id"],
                "question": row["question"],
                "options": {
                    "A": row["option_a"],
                    "B": row["option_b"],
                    "C": row["option_c"],
                    "D": row["option_d"],
                },
                "correct_option": row["correct_option"],
                "explanation": row["explanation"],
            }
        )
    return jsonify({"questions": questions})


@app.route("/api/quiz/submit", methods=["POST"])
def submit_quiz() -> tuple:
    payload = request.get_json(silent=True) or {}
    answers: Dict[str, str] = payload.get("answers", {})
    db = get_db()
    rows = db.execute(
        "SELECT id, correct_option, explanation FROM questions ORDER BY id"
    ).fetchall()

    results = []
    score = 0
    for row in rows:
        qid = str(row["id"])
        user_answer = str(answers.get(qid, "")).upper()
        is_correct = user_answer == row["correct_option"]
        if is_correct:
            score += 1
        results.append(
            {
                "question_id": row["id"],
                "your_answer": user_answer or None,
                "correct_answer": row["correct_option"],
                "is_correct": is_correct,
                "explanation": row["explanation"],
            }
        )
    total = len(rows) or 1
    return jsonify(
        {
            "score": score,
            "total": total,
            "results": results,
            "message": "Quiz graded successfully.",
        }
    )


@app.route("/api/tip")
def api_tip() -> tuple:
    db = get_db()
    tips = db.execute("SELECT id, tip FROM tips ORDER BY id").fetchall()
    if not tips:
        return jsonify({"tip": "Stay curious and keep learning about cyber safety!"})
    day_index = datetime.date.today().toordinal()
    tip_row = tips[day_index % len(tips)]
    return jsonify({"tip": tip_row["tip"]})


if __name__ == "__main__":
    init_db()
    app.run(debug=True)

