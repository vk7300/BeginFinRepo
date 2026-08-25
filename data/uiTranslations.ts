export type Language = 'en';

export const languageNames: Record<Language, string> = {
  en: 'English'
};

export const uiTranslations: Record<Language, Record<string, any>> = {
  en: {
    getStarted: 'Get Started',
    welcomeSub: 'Your foundation for a better financial future.',
    portalTitle: 'Education Portal',
    portalDesc: 'Your progress is stored locally in your browser. Start learning instantly without creating an account.',
    agreements: 'I agree to the {tc} and {pp}.',
    tc: 'Terms of Use',
    pp: 'Privacy Policy',
    backToDashboard: 'Back to Dashboard',
    courseCurriculum: 'Course Curriculum',
    viewCertProgress: 'View Certificate',
    overallProgress: 'Overall Progress',
    congratsTitle: 'Congratulations, Graduate!',
    congratsDesc: 'You have mastered the fundamentals of finance. Claim your finalized certificate or share your success with your network.',
    claimCert: 'Claim Certificate',
    shareAchievement: 'Share Achievement',
    aboutTitle: "Because financial literacy shouldn't be complicated",
    aboutDesc: "BeginFin is an open-source initiative by Vishnu Kakarla and Kruz Smith that aims to boost financial confidence worldwide.",
    takeQuiz: 'Start Knowledge Check',
    retryQuiz: 'Retry Quiz',
    reviewUnit: 'Review Unit',
    masteryAchieved: 'Mastery Achieved!',
    reviewRequired: 'Review Required',
    perfectScore: 'Perfect Score',
    completeUnit: 'Complete Unit',
    supportEmail: 'Support: support@begin-fin.com',
    learner: 'Learner',
    master: 'Master',
    masteryRequirement: 'To earn your certificate and move to the next unit, you must demonstrate 100% mastery by answering all questions correctly.',
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
