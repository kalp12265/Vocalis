Vocalis 🎙️
Speak. Analyze. Improve.

Vocalis is an AI-powered public speaking practice platform designed to help people become clearer, more confident, and more effective speakers through deliberate practice and intelligent feedback.

Instead of simply consuming public-speaking advice, Vocalis puts you in the situation that actually matters: you have to speak.

Choose a topic, speak for a limited amount of time, and receive structured feedback on your performance, including what you did well, where you struggled, and how you can improve.

🚀 Why Vocalis?

Public speaking is one of those skills that improves through practice, yet most people have very few opportunities to practice in a low-pressure environment.

You can watch hundreds of videos about communication.

You can read books about confidence.

But eventually, you have to open your mouth and speak.

Vocalis turns speaking practice into a repeatable training loop:

Pick a topic → Speak → Get analyzed → Learn → Speak again

The goal isn't to give you another course.

The goal is to give you a practice ground for communication.

✨ Core Features
🎯 Topic-Based Speaking Practice

Choose from different speaking categories and receive prompts designed to make you think and speak without relying on a script.

Topics can range from straightforward everyday questions to more unexpected and challenging prompts.

⏱️ Timed Speaking Sessions

Practice speaking under a time constraint.

The current MVP focuses on short-form speaking sessions designed to encourage spontaneous thinking and continuous speech.

🎙️ Browser-Based Recording

Vocalis uses the browser's native microphone capabilities to capture your speaking sessions without requiring a separate recording application.

📝 Speech Transcription

Your spoken response can be converted into text for analysis.

Vocalis uses the [AssemblyAI](https://www.assemblyai.com) JavaScript SDK to transcribe your recording. When you finish speaking, the recorded audio is uploaded to AssemblyAI's speech-to-text API, and the resulting transcript is what gets reviewed and analyzed. This runs server-side, so your API key is never exposed to the browser, and it works across browsers that don't support native speech recognition. You can still edit the transcript by hand before analysis if anything needs correcting.

The integration also uses several AssemblyAI features:

- **Speaker Diarization** — identifies individual speakers and labels each segment of the transcript, in case more than one voice is picked up in a recording.
- **Automatic Language Detection** — detects the spoken language and reports a confidence score, shown alongside your transcript.
- **Formatting** — numbers, dates, and similar entities are formatted for readability rather than transcribed verbatim.
- **Word Search** — search your finished transcript for specific words or phrases (e.g. filler words) and see how many times each one appears.
- **Prompting and Keyterms** — the practice topic you're responding to is passed to AssemblyAI as contextual prompting, improving transcription accuracy for topic-specific vocabulary.

🤖 AI-Powered Analysis

Vocalis analyzes your response and provides structured feedback around areas such as:

Strengths
Mistakes and blunders
Weak areas
Speaking performance
Improvement opportunities
Practical coaching suggestions

The objective is not simply to tell you that something was wrong.

It is to help answer:

"What should I do differently next time?"

📈 Progress Tracking

Track your practice history and performance over time.

The dashboard is designed around the idea that communication is a skill that improves through consistent practice rather than one-time evaluation.

🔄 Practice Again

Feedback is most useful when it leads to another attempt.

Vocalis makes it easy to return to practice and apply what you learned from previous sessions.

🗺️ Product Roadmap

Vocalis is currently focused on building a strong core speaking-practice experience.

Future directions include:

More advanced speaking analytics
Deeper performance tracking
Personalized practice plans
Adaptive difficulty
More sophisticated topic generation
Expanded communication skill categories
Better long-term progress insights
Mobile applications
Additional AI coaching capabilities
Hackathon pitch training (see below)
Custom words for better transcription, unlocked with points or Pro (see below)

🏆 Planned: Hackathon Pitch Training

A dedicated practice mode for pitching your own project idea, like you would in front of hackathon judges.

Instead of answering a generated topic, the user describes their project and then pitches it out loud. Vocalis analyzes the pitch with feedback built for pitching, such as:

Clarity of the problem and solution
Structure (hook → problem → solution → demo → impact)
Pacing against the time limit
Filler words and confidence
How memorable and convincing the pitch is

Pitch length options:

1 minute: elevator pitch
3 minutes: standard hackathon pitch
5 minutes: full pitch with demo walkthrough
10+ minutes: extended presentation (Pro)

💎 Points, Pro & Custom Words

Vocalis rewards practice with points, and points unlock more of the product.

How points are earned today:

Every session earns points by level: Beginner +10, Intermediate +20, Advanced +30, Chaotic +50
Practicing every prompt in a level earns a one-time bonus: +50 / +100 / +150 / +250
Daily chaos challenge: 3 Chaotic sessions of 3+ minutes in one day earns +75, once a day
Demo sessions and attempts under 20 seconds don't earn points

What points unlock today:

10, 15 or 20 minute sessions in every category, for 1 hour (150 / 250 / 400 points)

Why custom words are a points and Pro feature

Vocalis transcribes speech with AssemblyAI. AssemblyAI's keyterms prompting lets us send a list of words and phrases to recognize more accurately, such as a project name, a product, a teammate's name or technical jargon. This matters most for hackathon pitches and interviews, where the important words are often uncommon ones.

That list has a hard ceiling. From the AssemblyAI documentation:

"While we support up to 1000 key words and phrases, actual capacity may be lower due to internal tokenization and implementation constraints."

Key points to remember:

Each word in a multi-word phrase counts towards the 1,000 keyword limit
Capitalization affects capacity (uppercase tokens use more than lowercase)
Longer words use more capacity than shorter words

Because custom-word capacity is limited per transcript, we treat it as a resource users can earn or buy instead of giving it away without limit. (Planned; custom words are not sent to AssemblyAI yet.)

Free: a small set of custom words per session, enough for your name and your project's name
Points: redeem points to raise your custom-word allowance, the same way points unlock longer sessions
Pro: the largest custom-word allowance, within AssemblyAI's limit, plus 10+ minute sessions

Buying points

Point packs (500, 1,500 and 4,000 points) are shown in the app, but checkout is not connected yet and nothing is charged. Before real payments go live, points and purchases need to move from browser storage to the server so balances can't be edited.

The long-term vision is to make Vocalis a comprehensive AI communication training platform, not merely a speech analyzer.

🎯 Vision

Communication is a skill.

And skills are built through deliberate practice.

Vocalis aims to make that practice:

Accessible. Repeatable. Measurable. Personalized.

The long-term goal is simple:

Help people become better speakers by giving them a place to practice every day.

⚙️ Setup

To run transcription locally, add your AssemblyAI API key to a `.env.local` file in the project root:

```
ASSEMBLYAI_API_KEY=your-key-here
```

Get a key from the [AssemblyAI dashboard](https://www.assemblyai.com/dashboard).

🚧 Current Status

Vocalis is currently an MVP under active development.

The project is being developed with a focus on validating the core experience:

Speaking → Analysis → Feedback → Improvement → Repeat

Features, architecture, and AI integrations may continue to evolve as the product develops.

🤝 Contributing

Contributions, ideas, and feedback are welcome.

If you find a bug or have an idea that could make Vocalis better, feel free to open an issue or submit a pull request.

📄 License

This project is currently provided for development and evaluation purposes.

A formal open-source license may be added as the project evolves.

🌐 Project

Vocalis

Speak. Analyze. Improve.

Built to help people turn communication from something they worry about into something they can deliberately train.
