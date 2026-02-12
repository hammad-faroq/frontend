import {
  startCandidateInterview,
  getCandidateInterviewQuestions,
  submitSingleAnswer,
  submitBulkAnswers,
  getCandidateInterviewDetail,
  trackInterviewProgress,
  getInterviewResult
} from './interviewApi';

class InterviewService {
  constructor() {
    this.currentInterviewId = null;
    this.questions = [];
    this.answers = {};
    this.timer = null;
  }

  // Start the interview
  async startInterview(interviewId) {
    try {
      this.currentInterviewId = interviewId;
      
      // Start the interview
      const startResult = await startCandidateInterview(interviewId);
      
      // Get questions
      const questionsData = await getCandidateInterviewQuestions(interviewId);
      this.questions = questionsData.questions;
      
      // Initialize answers
      this.initializeAnswers();
      
      // Get progress
      const progress = await trackInterviewProgress(interviewId);
      
      return {
        success: true,
        startResult,
        questions: this.questions,
        progress,
        totalQuestions: this.questions.length
      };
    } catch (error) {
      console.error('InterviewService - startInterview error:', error);
      throw error;
    }
  }

  // Initialize answers object
  initializeAnswers() {
    this.answers = {};
    this.questions.forEach(question => {
      this.answers[question.id] = {
        question_id: question.id,
        question_type: question.question_type,
        answer_text: '',
        selected_options: [],
        code_snippet: '',
        time_taken_seconds: 0,
        startTime: Date.now()
      };
    });
  }

  // Submit a single answer
  async submitAnswer(questionId, answerData) {
    try {
      if (!this.currentInterviewId) {
        throw new Error('No active interview');
      }

      const answer = {
        question_id: questionId,
        ...answerData,
        time_taken_seconds: this.calculateTimeTaken(questionId)
      };

      const result = await submitSingleAnswer(this.currentInterviewId, answer);
      
      // Update local answer
      if (this.answers[questionId]) {
        this.answers[questionId] = {
          ...this.answers[questionId],
          ...answerData,
          submitted: true,
          submitted_at: new Date().toISOString()
        };
      }

      return {
        success: true,
        result,
        answerId: result.answer_id
      };
    } catch (error) {
      console.error('InterviewService - submitAnswer error:', error);
      throw error;
    }
  }

  // Submit all answers at once
  async submitAllAnswers() {
    try {
      if (!this.currentInterviewId) {
        throw new Error('No active interview');
      }

      const answersArray = Object.values(this.answers).map(answer => ({
        question_id: answer.question_id,
        answer_text: answer.answer_text || '',
        selected_options: answer.selected_options || [],
        code_snippet: answer.code_snippet || '',
        time_taken_seconds: answer.time_taken_seconds || 0
      }));

      const result = await submitBulkAnswers(this.currentInterviewId, answersArray);
      
      // Mark all as submitted
      Object.keys(this.answers).forEach(questionId => {
        this.answers[questionId].submitted = true;
      });

      return {
        success: true,
        result,
        submittedCount: answersArray.length
      };
    } catch (error) {
      console.error('InterviewService - submitAllAnswers error:', error);
      throw error;
    }
  }

  // Get interview progress
  async getProgress() {
    if (!this.currentInterviewId) {
      throw new Error('No active interview');
    }

    return await trackInterviewProgress(this.currentInterviewId);
  }

  // Get interview result
  async getResult() {
    if (!this.currentInterviewId) {
      throw new Error('No active interview');
    }

    return await getInterviewResult(this.currentInterviewId);
  }

  // Update answer locally (without submitting)
  updateAnswer(questionId, data) {
    if (!this.answers[questionId]) {
      this.answers[questionId] = {
        question_id: questionId,
        startTime: Date.now()
      };
    }

    this.answers[questionId] = {
      ...this.answers[questionId],
      ...data,
      lastUpdated: Date.now()
    };
  }

  // Get answer for a question
  getAnswer(questionId) {
    return this.answers[questionId] || null;
  }

  // Get all answers
  getAllAnswers() {
    return this.answers;
  }

  // Calculate time taken for a question
  calculateTimeTaken(questionId) {
    if (!this.answers[questionId] || !this.answers[questionId].startTime) {
      return 0;
    }
    
    const timeTaken = Math.floor((Date.now() - this.answers[questionId].startTime) / 1000);
    return timeTaken;
  }

  // Get unanswered questions count
  getUnansweredCount() {
    const answered = Object.values(this.answers).filter(
      answer => (answer.answer_text && answer.answer_text.trim()) || 
                (answer.selected_options && answer.selected_options.length > 0) ||
                (answer.code_snippet && answer.code_snippet.trim())
    ).length;
    
    return this.questions.length - answered;
  }

  // Reset service
  reset() {
    this.currentInterviewId = null;
    this.questions = [];
    this.answers = {};
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// Export as singleton
export default new InterviewService();