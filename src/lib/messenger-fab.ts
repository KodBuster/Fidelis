export const MESSENGER_FAB_OPEN_EVENT = "messenger-fab:open";

export type MessengerFabOpenDetail = {
  focusOnDesktop?: boolean;
};

/** Opens the expandable messenger FAB (Sharoduvy-style). */
export function openMessengerFab(_options?: MessengerFabOpenDetail) {
  window.dispatchEvent(
    new CustomEvent<MessengerFabOpenDetail>(MESSENGER_FAB_OPEN_EVENT, {
      detail: { focusOnDesktop: true, ..._options },
    }),
  );
}
