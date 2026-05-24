import type { AdaptivePath, AdaptiveAction } from './types'

/**
 * Default adaptive actions when no custom rules exist
 */
const defaultActions: Record<AdaptivePath, AdaptiveAction> = {
  refuerzo: {
    path: 'refuerzo',
    show_reinforcement: true,
    show_challenge: false,
    message_title: '¡Sigue practicando! 💪',
    message_body: 'Te preparamos material de refuerzo para que domines este tema. No te preocupes, ¡cada intento te acerca más!',
    xp_multiplier: 0.5,
  },
  normal: {
    path: 'normal',
    show_reinforcement: false,
    show_challenge: false,
    message_title: '¡Buen trabajo! 👍',
    message_body: 'Has demostrado un buen entendimiento del tema. Puedes continuar con la siguiente lección.',
    xp_multiplier: 1.0,
  },
  desafio: {
    path: 'desafio',
    show_reinforcement: false,
    show_challenge: true,
    message_title: '¡Excelente! 🌟',
    message_body: '¡Dominas este tema! Te desbloqueamos contenido de desafío para llevar tu aprendizaje al siguiente nivel.',
    xp_multiplier: 1.5,
  },
}

/**
 * Get adaptive action for a given path
 * First tries to use custom rules from DB, falls back to defaults
 */
export function getAdaptiveAction(
  path: AdaptivePath,
  customAction?: any
): AdaptiveAction {
  if (customAction?.next_action) {
    return {
      path,
      show_reinforcement: customAction.next_action.show_reinforcement ?? defaultActions[path].show_reinforcement,
      show_challenge: customAction.next_action.show_challenge ?? defaultActions[path].show_challenge,
      extra_quiz_ids: customAction.next_action.extra_quiz_ids,
      suggested_review_lesson_ids: customAction.next_action.suggested_review_lesson_ids,
      message_title: customAction.next_action.message_title ?? defaultActions[path].message_title,
      message_body: customAction.next_action.message_body ?? defaultActions[path].message_body,
      xp_multiplier: customAction.next_action.xp_multiplier ?? defaultActions[path].xp_multiplier,
      unlock_badge_id: customAction.next_action.unlock_badge_id,
    }
  }

  return defaultActions[path]
}
