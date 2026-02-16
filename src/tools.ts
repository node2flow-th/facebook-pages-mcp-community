/**
 * Facebook Pages API - MCP Tool Definitions (28 tools)
 */

export interface MCPToolDefinition {
  name: string;
  description: string;
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
  inputSchema: Record<string, unknown>;
}

export const TOOLS: MCPToolDefinition[] = [
  // ========== Pages (3) ==========
  {
    name: 'fb_list_pages',
    description:
      'List all Facebook Pages the user manages. Returns page ID, name, category, and access token for each page. Use this to find the page_id for other tools.',
    annotations: {
      title: 'List Pages',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        _info: { type: 'string', description: 'No parameters required. Uses the configured Page Access Token to list all managed pages.' },
      },
    },
  },
  {
    name: 'fb_get_page',
    description:
      'Get detailed information about a Facebook Page: name, category, followers, fan count, about, description, website, and more.',
    annotations: {
      title: 'Get Page Info',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID (numeric). Use fb_list_pages to find this.' },
        fields: { type: 'string', description: 'Comma-separated fields to return (e.g. "name,category,fan_count,followers_count,about,website"). Default: all basic fields.' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_get_page_token',
    description:
      'Get the Page Access Token for a specific page. Useful when managing multiple pages — each page has its own token.',
    annotations: {
      title: 'Get Page Token',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID to get the access token for' },
      },
      required: ['page_id'],
    },
  },

  // ========== Posts (6) ==========
  {
    name: 'fb_list_posts',
    description:
      'List posts from a Facebook Page feed. Returns post ID, message, creation time, picture, and permalink. Supports pagination via limit parameter.',
    annotations: {
      title: 'List Posts',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID' },
        limit: { type: 'number', description: 'Number of posts to return (default: 25, max: 100)' },
        fields: { type: 'string', description: 'Comma-separated fields (e.g. "id,message,created_time,shares,likes.summary(true)")' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_get_post',
    description:
      'Get details of a single Facebook post by ID. Returns message, creation time, picture, permalink, and engagement counts.',
    annotations: {
      title: 'Get Post',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        post_id: { type: 'string', description: 'Facebook Post ID (format: pageId_postId)' },
        fields: { type: 'string', description: 'Comma-separated fields to return (e.g. "id,message,created_time,shares,likes.summary(true),comments.summary(true)")' },
      },
      required: ['post_id'],
    },
  },
  {
    name: 'fb_create_post',
    description:
      'Create a new post on a Facebook Page. Can include text message and/or link. Set published=false to create an unpublished (draft) post.',
    annotations: {
      title: 'Create Post',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID to post to' },
        message: { type: 'string', description: 'Text content of the post' },
        link: { type: 'string', description: 'URL to attach to the post (creates link preview)' },
        published: { type: 'boolean', description: 'Set to false to create an unpublished/draft post (default: true)' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_update_post',
    description:
      'Update the text message of an existing Facebook post. Only the message field can be edited after creation.',
    annotations: {
      title: 'Update Post',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        post_id: { type: 'string', description: 'Facebook Post ID to update (format: pageId_postId)' },
        message: { type: 'string', description: 'New text content for the post' },
      },
      required: ['post_id', 'message'],
    },
  },
  {
    name: 'fb_delete_post',
    description:
      'Permanently delete a Facebook post. This action cannot be undone.',
    annotations: {
      title: 'Delete Post',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        post_id: { type: 'string', description: 'Facebook Post ID to delete (format: pageId_postId)' },
      },
      required: ['post_id'],
    },
  },
  {
    name: 'fb_schedule_post',
    description:
      'Schedule a post to be published at a future time. The scheduled_time must be between 10 minutes and 75 days from now (Unix timestamp in seconds).',
    annotations: {
      title: 'Schedule Post',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID' },
        message: { type: 'string', description: 'Text content of the scheduled post' },
        scheduled_time: { type: 'number', description: 'Unix timestamp (seconds) for when to publish. Must be 10min-75days from now.' },
        link: { type: 'string', description: 'Optional URL to attach to the post' },
      },
      required: ['page_id', 'message', 'scheduled_time'],
    },
  },

  // ========== Comments (5) ==========
  {
    name: 'fb_list_comments',
    description:
      'List comments on a Facebook post or object. Returns comment ID, message, author, time, like count, and hidden status.',
    annotations: {
      title: 'List Comments',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        object_id: { type: 'string', description: 'Post ID or object ID to get comments from' },
        limit: { type: 'number', description: 'Number of comments to return (default: 25)' },
      },
      required: ['object_id'],
    },
  },
  {
    name: 'fb_create_comment',
    description:
      'Add a comment to a Facebook post. The page will be shown as the comment author.',
    annotations: {
      title: 'Create Comment',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        object_id: { type: 'string', description: 'Post ID to comment on' },
        message: { type: 'string', description: 'Comment text' },
      },
      required: ['object_id', 'message'],
    },
  },
  {
    name: 'fb_reply_comment',
    description:
      'Reply to an existing comment. Creates a threaded reply under the specified comment.',
    annotations: {
      title: 'Reply to Comment',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'string', description: 'Comment ID to reply to' },
        message: { type: 'string', description: 'Reply text' },
      },
      required: ['comment_id', 'message'],
    },
  },
  {
    name: 'fb_delete_comment',
    description:
      'Permanently delete a comment. This action cannot be undone.',
    annotations: {
      title: 'Delete Comment',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'string', description: 'Comment ID to delete' },
      },
      required: ['comment_id'],
    },
  },
  {
    name: 'fb_hide_comment',
    description:
      'Hide or unhide a comment. Hidden comments are only visible to the author and page admins. Useful for moderation.',
    annotations: {
      title: 'Hide/Unhide Comment',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'string', description: 'Comment ID to hide/unhide' },
        is_hidden: { type: 'boolean', description: 'true to hide, false to unhide' },
      },
      required: ['comment_id', 'is_hidden'],
    },
  },

  // ========== Photos (3) ==========
  {
    name: 'fb_upload_photo',
    description:
      'Upload a photo to a Facebook Page from a URL. Can include a caption. Set published=false for an unpublished photo (use in multi-photo posts).',
    annotations: {
      title: 'Upload Photo',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID' },
        url: { type: 'string', description: 'Public URL of the photo to upload' },
        caption: { type: 'string', description: 'Caption text for the photo' },
        published: { type: 'boolean', description: 'Set to false for unpublished photo (default: true)' },
      },
      required: ['page_id', 'url'],
    },
  },
  {
    name: 'fb_list_photos',
    description:
      'List photos uploaded to a Facebook Page. Returns photo ID, name, link, creation time, and image URLs at various sizes.',
    annotations: {
      title: 'List Photos',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID' },
        limit: { type: 'number', description: 'Number of photos to return (default: 25)' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_delete_photo',
    description:
      'Permanently delete a photo from a Facebook Page.',
    annotations: {
      title: 'Delete Photo',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        photo_id: { type: 'string', description: 'Photo ID to delete' },
      },
      required: ['photo_id'],
    },
  },

  // ========== Videos (3) ==========
  {
    name: 'fb_upload_video',
    description:
      'Upload a video to a Facebook Page from a URL. Supports title and description. For large videos (>1GB), use chunked upload via Facebook UI.',
    annotations: {
      title: 'Upload Video',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID' },
        file_url: { type: 'string', description: 'Public URL of the video file to upload' },
        title: { type: 'string', description: 'Video title' },
        description: { type: 'string', description: 'Video description' },
      },
      required: ['page_id', 'file_url'],
    },
  },
  {
    name: 'fb_list_videos',
    description:
      'List videos uploaded to a Facebook Page. Returns video ID, title, description, creation time, duration, and source URL.',
    annotations: {
      title: 'List Videos',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID' },
        limit: { type: 'number', description: 'Number of videos to return (default: 25)' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_delete_video',
    description:
      'Permanently delete a video from a Facebook Page.',
    annotations: {
      title: 'Delete Video',
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        video_id: { type: 'string', description: 'Video ID to delete' },
      },
      required: ['video_id'],
    },
  },

  // ========== Insights (4) ==========
  {
    name: 'fb_get_page_insights',
    description:
      'Get analytics metrics for a Facebook Page. Common metrics: page_impressions, page_engaged_users, page_post_engagements, page_fan_adds. Period: day, week, days_28.',
    annotations: {
      title: 'Get Page Insights',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID' },
        metric: { type: 'string', description: 'Comma-separated metrics (e.g. "page_impressions,page_engaged_users,page_post_engagements")' },
        period: { type: 'string', description: 'Aggregation period: "day", "week", or "days_28" (default: day)' },
        since: { type: 'string', description: 'Start date in YYYY-MM-DD format or Unix timestamp' },
        until: { type: 'string', description: 'End date in YYYY-MM-DD format or Unix timestamp (max 90 days range)' },
      },
      required: ['page_id', 'metric'],
    },
  },
  {
    name: 'fb_get_post_insights',
    description:
      'Get analytics for a specific post. Common metrics: post_impressions, post_engaged_users, post_clicks, post_reactions_by_type_total.',
    annotations: {
      title: 'Get Post Insights',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        post_id: { type: 'string', description: 'Facebook Post ID (format: pageId_postId)' },
        metric: { type: 'string', description: 'Comma-separated metrics (e.g. "post_impressions,post_engaged_users,post_clicks")' },
      },
      required: ['post_id', 'metric'],
    },
  },
  {
    name: 'fb_get_page_fans',
    description:
      'Get total fan (follower) count for a Facebook Page over time. Returns daily values showing the total page likes.',
    annotations: {
      title: 'Get Page Fans',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_get_page_views',
    description:
      'Get page view count over time. Returns total number of times the Page profile was viewed.',
    annotations: {
      title: 'Get Page Views',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID' },
        period: { type: 'string', description: 'Aggregation period: "day", "week", or "days_28" (default: day)' },
      },
      required: ['page_id'],
    },
  },

  // ========== Conversations (4) ==========
  {
    name: 'fb_list_conversations',
    description:
      'List Messenger conversations for a Facebook Page. Returns conversation ID, last update time, snippet, message count, and participants.',
    annotations: {
      title: 'List Conversations',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID' },
        limit: { type: 'number', description: 'Number of conversations to return (default: 25)' },
      },
      required: ['page_id'],
    },
  },
  {
    name: 'fb_get_messages',
    description:
      'Get messages from a specific Messenger conversation. Returns message ID, text, sender, and time.',
    annotations: {
      title: 'Get Messages',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        conversation_id: { type: 'string', description: 'Conversation ID from fb_list_conversations' },
        limit: { type: 'number', description: 'Number of messages to return (default: 25)' },
      },
      required: ['conversation_id'],
    },
  },
  {
    name: 'fb_send_message',
    description:
      'Send a text message via Messenger to a user. Requires the recipient PSID (Page-Scoped ID). Note: 24-hour messaging window applies — can only respond within 24h of the user\'s last message.',
    annotations: {
      title: 'Send Message',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID' },
        recipient_id: { type: 'string', description: 'Recipient PSID (Page-Scoped User ID). Found in conversation participants.' },
        text: { type: 'string', description: 'Message text to send (max 2000 characters)' },
      },
      required: ['page_id', 'recipient_id', 'text'],
    },
  },
  {
    name: 'fb_send_typing',
    description:
      'Show or hide the typing indicator in Messenger. Use before sending a message for a more natural conversation feel.',
    annotations: {
      title: 'Send Typing Indicator',
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        page_id: { type: 'string', description: 'Facebook Page ID' },
        recipient_id: { type: 'string', description: 'Recipient PSID (Page-Scoped User ID)' },
        action: { type: 'string', description: 'Typing action: "typing_on", "typing_off", or "mark_seen" (default: typing_on)' },
      },
      required: ['page_id', 'recipient_id'],
    },
  },
];
