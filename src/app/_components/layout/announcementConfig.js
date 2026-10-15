// Shared by AnnouncementBar (client) and the pages layout guard script
// (server), so a plain module rather than the client component file.
export const ANNOUNCEMENT_URL = 'https://tally.so/r/b5ByWe';
// Change the id for a new announcement: visitors who closed the previous
// one will see it again.
export const ANNOUNCEMENT_ID = 'feedback-tshirt';
export const ANNOUNCEMENT_STORAGE_KEY = 'oo-announcement-dismissed';
