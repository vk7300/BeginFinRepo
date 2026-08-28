export type Language = 'en';

export const languageNames: Record<Language, string> = {
  en: 'English'
};

export const uiTranslations: Record<Language, Record<string, any>> = {
  en: {
    getStarted: 'Get Started',
    welcomeSub: 'Your foundation for a better financial future.',
    portalTitle: 'Education Portal',
    portalDesc: 'Your progress is stored securely in your browser so you can jump in and learn anytime.',
    agreements: 'I agree to the {tc} and {pp}.',
    tc: 'Terms of Use',
    pp: 'Privacy Policy',
    backToDashboard: 'Back to Dashboard',
    courseCurriculum: 'Course Curriculum',
    viewCertProgress: 'View Certificate Progress',
    overallProgress: 'Overall Progress',
    congratsTitle: 'Mastery Achieved! Congratulations!',
    congratsDesc: 'You have built a strong foundation in personal finance. Claim your verified certificate or share your achievement with your network.',
    claimCert: 'Claim Certificate',
    shareAchievement: 'Share Achievement',
    aboutTitle: "Because financial literacy shouldn't be complicated",
    aboutDesc: "BeginFin is an open-source initiative by Vishnu Kakarla and Kruz Smith that aims to boost financial confidence worldwide.",
    takeQuiz: 'Start Knowledge Check',
    retryQuiz: 'Retry Quiz',
    reviewUnit: 'Review Unit',
    masteryAchieved: 'Mastery Achieved!',
    reviewRequired: 'Keep Practicing — Almost There!',
    perfectScore: 'Perfect Score',
    completeUnit: 'Complete Unit',
    supportEmail: 'Support: support@begin-fin.com',
    learner: 'Learner',
    master: 'Master',
    masteryRequirement: 'To ensure deep understanding and earn your certificate, you must achieve 100% on the quiz. Review the lesson and try again whenever you are ready.',
    prevSection: 'Previous Section',
    nextSection: 'Next Section',
    prevQuestion: 'Previous Question',
    nextQuestion: 'Next Question',
    finishQuiz: 'Finish Quiz',
    questionOf: 'Question {current} of {total}',
    reviewMistakes: 'Review Mistakes',
    backToResults: 'Back to Results',
    yourAnswer: 'Your Answer: {answer}',
    correctAnswer: 'Correct Answer: {answer}',
    reviewIncorrect: 'Review Incorrect Answers'
  }
};
