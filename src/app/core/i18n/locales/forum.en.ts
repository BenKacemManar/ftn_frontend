import { forum_fr } from './forum.fr';

export const forum_en: typeof forum_fr = {
  forum: {
    home: {
      kicker: 'Forum',
      titleLine1: 'Discussions',
      titleItalic: '& exchanges.',
      empty: 'No forum category yet.',
      topicsCount: '{{count}} topics',
    },
    backToForumLabel: 'Back to forum',
    backLabel: 'Back',
    newThread: {
      cta: '+ New topic',
      heading: 'New topic',
      titleLabel: 'Title',
      contentLabel: 'Content',
      imageUrlLabel: 'Image URL (optional)',
      create: 'Create',
      cancel: 'Cancel',
    },
    empty: 'No topics yet.',
    notFound: 'Topic not found.',
    views: 'views',
    repliesCount: 'replies',
    replies: {
      heading: 'Replies',
      formHeading: 'Your reply',
      placeholder: 'Write your reply…',
      imageUrlLabel: 'Image URL (optional)',
      sending: 'Sending…',
      submit: 'Reply',
      loginPrompt: 'Log in',
      loginSuffix: 'to reply.',
    },
  },
};
