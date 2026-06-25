import { TourStep } from './types'

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'home-streak',
    targetId: 'streak-card',
    title: 'Weekly Streak',
    description:
      'Stay consistent and build momentum. Every completed workout contributes to your weekly streak.',
    tooltipPosition: 'bottom',
    screen: 'home',
  },
  {
    id: 'home-monthly-count',
    targetId: 'monthly-count',
    title: 'Workouts This Month',
    description:
      'Track your consistency at a glance. This shows how many days you worked out this month.',
    tooltipPosition: 'bottom',
    screen: 'home',
  },
  {
    id: 'home-pr',
    targetId: 'pr-section',
    title: 'Personal Records',
    description:
      'Your strongest achievements appear here. Set new personal records and watch your strength improve over time.',
    tooltipPosition: 'bottom',
    anchorTargetId: 'monthly-count',
    forceBelow: true,
    screen: 'home',
  },
  {
    id: 'home-start-session',
    targetId: 'start-session-btn',
    title: 'Start Session',
    description:
      'Ready to train? Tap Start Session to choose exercises and begin your workout.',
    tooltipPosition: 'top',
    screen: 'home',
    requireInteraction: true,
  },
  {
    id: 'exercise-list',
    targetId: 'exercise-list',
    title: 'Default Exercises',
    description:
      'These exercises are ready to use. Select any exercise and start training immediately.',
    tooltipPosition: 'bottom',
    screen: 'exercise-list',
  },
  {
    id: 'my-exercises-tab',
    targetId: 'my-exercises-tab',
    title: 'My Exercises',
    description:
      'Switch to My Exercises to access your custom exercises and create new ones.',
    tooltipPosition: 'bottom',
    screen: 'exercise-list',
    requireInteraction: true,
  },
  {
    id: 'exercise-add',
    targetId: 'add-exercise-btn',
    title: 'Add New Exercise',
    description:
      'Create custom exercises that match your training style and goals.',
    tooltipPosition: 'bottom',
    screen: 'exercise-list',
    requireInteraction: true,
  },
  {
    id: 'exercise-name',
    targetId: 'exercise-name-input',
    title: 'Exercise Name',
    description:
      'Enter a descriptive name for your exercise so you can easily identify it later.',
    tooltipPosition: 'top',
    screen: 'create-exercise',
  },
  {
    id: 'exercise-category',
    targetId: 'exercise-category-selector',
    title: 'Choose Category',
    description:
      'Select a muscle group category for your new exercise.',
    tooltipPosition: 'top',
    screen: 'create-exercise',
    requireInteraction: true,
  },
  {
    id: 'exercise-type-selector',
    targetId: 'exercise-type-selector',
    title: 'Exercise Type Selection',
    description: 'Choose how you want to track this exercise.',
    tooltipPosition: 'top',
    screen: 'create-exercise',
  },
  {
    id: 'weight-mode',
    targetId: 'weight-mode-option',
    title: 'Weight Mode',
    description:
      'Weight Mode is ideal for strength training and muscle building.\n\nExamples:\n\u2022 Bench Press\n\u2022 Squat\n\u2022 Deadlift\n\u2022 Shoulder Press\n\nTrack reps and weight to measure progress.',
    tooltipPosition: 'bottom',
    screen: 'create-exercise',
  },
  {
    id: 'timer-mode',
    targetId: 'timer-mode-option',
    title: 'Timer Mode',
    description:
      'Timer Mode is ideal for stamina, endurance, and cardio exercises.\n\nExamples:\n\u2022 Plank\n\u2022 Running\n\u2022 Jump Rope\n\u2022 Wall Sit\n\u2022 Cycling\n\nTrack duration instead of weight and reps.',
    tooltipPosition: 'bottom',
    screen: 'create-exercise',
  },
  {
    id: 'mode-comparison',
    targetId: 'mode-comparison',
    title: 'Choosing the Right Mode',
    description:
      'Quick Rule:\n\nWeight Mode = Strength & Muscle Building\n\nTimer Mode = Cardio, Endurance & Stamina',
    tooltipPosition: 'top',
    screen: 'create-exercise',
  },
  {
    id: 'create-exercise-btn',
    targetId: 'create-exercise-btn',
    title: 'Create First Exercise',
    description:
      'Create your first custom exercise and add it to your workout library.',
    tooltipPosition: 'top',
    screen: 'create-exercise',
    requireInteraction: true,
  },
  {
    id: 'select-exercise',
    targetId: 'custom-exercise-0',
    title: 'Select Exercise',
    description: 'Tap your new exercise to begin tracking your workout.',
    tooltipPosition: 'bottom',
    screen: 'exercise-list',
    requireInteraction: true,
  },
  {
    id: 'exercise-detail',
    targetId: 'exercise-select-btn',
    title: 'Confirm Exercise',
    description: 'Tap Select to add this exercise and start your workout.',
    tooltipPosition: 'top',
    screen: 'exercise-detail',
    requireInteraction: true,
  },
  {
    id: 'reps-weight',
    targetId: 'reps-weight-inputs',
    title: 'Reps & Weight Tracking',
    description:
      'Log your reps and weight after each set. Your progress and personal records are calculated from this data.',
    tooltipPosition: 'bottom',
    screen: 'session-tracker',
  },
  {
    id: 'workout-memories',
    targetId: 'camera-video-buttons',
    title: 'Workout Memories & Notes',
    description:
      'Capture photos and videos during workouts and add notes, technique reminders, or energy levels to document your training.',
    tooltipPosition: 'bottom',
    screen: 'session-tracker',
  },
  {
    id: 'rest-timer',
    targetId: 'rest-timer',
    title: 'Rest Timer',
    description:
      'Use the rest timer to manage recovery between sets and maintain workout intensity.',
    tooltipPosition: 'top',
    screen: 'session-tracker',
  },
  {
    id: 'session-add-exercises',
    targetId: 'session-add-exercises-btn',
    title: 'Add More Exercises',
    description:
      'You can add more exercises to this session at any time. Tap here to include additional exercises.',
    tooltipPosition: 'bottom',
    screen: 'session-tracker',
  },
  {
    id: 'save-session',
    targetId: 'save-session-btn',
    title: 'Save Session',
    description:
      'Save your workout to permanently store sets, weights, notes, photos, and videos.',
    tooltipPosition: 'top',
    screen: 'session-tracker',
    requireInteraction: true,
  },
  {
    id: 'history-tab',
    targetId: 'history-tab-btn',
    title: 'History Tab',
    description:
      'Every workout you save is stored here for future reference.',
    tooltipPosition: 'top',
    screen: 'history',
  },
  {
    id: 'previous-sessions',
    targetId: 'session-history-list',
    title: 'Workouts This Month',
    description:
      'Open any session to review exercises, progress, notes, and workout memories.',
    tooltipPosition: 'bottom',
    screen: 'history',
    requireInteraction: true,
  },
  {
    id: 'profile-tab',
    targetId: 'profile-tab-btn',
    title: 'Profile Tab',
    description:
      'Manage your profile, personal information, and workout journey from here.',
    tooltipPosition: 'top',
    screen: 'profile',
  },
  {
    id: 'edit-profile',
    targetId: 'profile-info',
    title: 'Edit Profile',
    description:
      'Update your photo, age, height, weight, and personal details anytime.',
    tooltipPosition: 'bottom',
    screen: 'profile',
  },
  {
    id: 'workout-gallery',
    targetId: 'workout-gallery',
    title: 'Workout Gallery',
    description:
      'All workout photos and videos are stored here so you can revisit your fitness journey anytime.',
    tooltipPosition: 'bottom',
    screen: 'profile',
  },
  {
    id: 'tour-complete',
    title: "You're Ready to Train",
    description: '',
    screen: 'complete',
  },
]

export const TOTAL_STEPS = TOUR_STEPS.length
