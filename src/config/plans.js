export const PLANS = Object.freeze({
  basic: Object.freeze({
    id: 'basic',
    name: 'Basic',
    amount: 39000,
    invitationLimit: 1,
    durationDays: 365,
    galleryLimit: 5,
  }),
  premium: Object.freeze({
    id: 'premium',
    name: 'Premium',
    amount: 79000,
    invitationLimit: 1,
    durationDays: null,
    galleryLimit: 15,
  }),
  exclusive: Object.freeze({
    id: 'exclusive',
    name: 'Exclusive',
    amount: 149000,
    invitationLimit: 3,
    durationDays: null,
    galleryLimit: 15,
  }),
});

export function getPlan(planId) {
  return PLANS[planId] || null;
}
