/**
 * Facebook Graph API Client
 * Auth via Page Access Token in query param: ?access_token=xxx
 * Base URL: https://graph.facebook.com/v22.0/
 */

import type {
  FacebookConfig,
  FacebookPage,
  FacebookPost,
  FacebookComment,
  FacebookPhoto,
  FacebookVideo,
  FacebookInsight,
  FacebookConversation,
  FacebookMessage,
} from './types.js';

interface GraphApiResponse<T = unknown> {
  data?: T[];
  paging?: { cursors?: { before: string; after: string }; next?: string };
  error?: { message: string; type: string; code: number };
  id?: string;
  success?: boolean;
}

export class FacebookClient {
  private config: FacebookConfig;
  private baseUrl = 'https://graph.facebook.com/v22.0';

  constructor(config: FacebookConfig) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    method: string = 'GET',
    body?: Record<string, unknown>,
    extraParams?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${path}`);
    url.searchParams.set('access_token', this.config.pageAccessToken);
    if (extraParams) {
      for (const [k, v] of Object.entries(extraParams)) {
        url.searchParams.set(k, v);
      }
    }

    const options: RequestInit = { method };
    if (body && (method === 'POST' || method === 'DELETE')) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), options);
    const data = await response.json() as T & { error?: { message: string; code: number } };

    if ((data as any).error) {
      throw new Error(`Facebook API Error (${(data as any).error.code}): ${(data as any).error.message}`);
    }

    return data;
  }

  // ========== Pages (3) ==========

  async listPages(): Promise<FacebookPage[]> {
    const res = await this.request<GraphApiResponse<FacebookPage>>('me/accounts');
    return res.data || [];
  }

  async getPage(pageId: string, fields?: string): Promise<FacebookPage> {
    const params: Record<string, string> = {};
    if (fields) params.fields = fields;
    return this.request<FacebookPage>(pageId, 'GET', undefined, params);
  }

  async getPageToken(pageId: string): Promise<{ access_token: string }> {
    return this.request<{ access_token: string }>(pageId, 'GET', undefined, { fields: 'access_token' });
  }

  // ========== Posts (6) ==========

  async listPosts(pageId: string, limit?: number, fields?: string): Promise<FacebookPost[]> {
    const params: Record<string, string> = {};
    if (limit) params.limit = String(limit);
    if (fields) params.fields = fields;
    else params.fields = 'id,message,created_time,updated_time,full_picture,permalink_url';
    const res = await this.request<GraphApiResponse<FacebookPost>>(`${pageId}/feed`, 'GET', undefined, params);
    return res.data || [];
  }

  async getPost(postId: string, fields?: string): Promise<FacebookPost> {
    const params: Record<string, string> = {};
    if (fields) params.fields = fields;
    else params.fields = 'id,message,created_time,updated_time,full_picture,permalink_url,shares';
    return this.request<FacebookPost>(postId, 'GET', undefined, params);
  }

  async createPost(pageId: string, message?: string, link?: string, published?: boolean): Promise<{ id: string }> {
    const body: Record<string, unknown> = {};
    if (message) body.message = message;
    if (link) body.link = link;
    if (published !== undefined) body.published = published;
    return this.request<{ id: string }>(`${pageId}/feed`, 'POST', body);
  }

  async updatePost(postId: string, message: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(postId, 'POST', { message });
  }

  async deletePost(postId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(postId, 'DELETE');
  }

  async schedulePost(
    pageId: string,
    message: string,
    scheduledTime: number,
    link?: string
  ): Promise<{ id: string }> {
    const body: Record<string, unknown> = {
      message,
      published: false,
      scheduled_publish_time: scheduledTime,
    };
    if (link) body.link = link;
    return this.request<{ id: string }>(`${pageId}/feed`, 'POST', body);
  }

  // ========== Comments (5) ==========

  async listComments(objectId: string, limit?: number): Promise<FacebookComment[]> {
    const params: Record<string, string> = { fields: 'id,message,from,created_time,like_count,is_hidden' };
    if (limit) params.limit = String(limit);
    const res = await this.request<GraphApiResponse<FacebookComment>>(`${objectId}/comments`, 'GET', undefined, params);
    return res.data || [];
  }

  async createComment(objectId: string, message: string): Promise<{ id: string }> {
    return this.request<{ id: string }>(`${objectId}/comments`, 'POST', { message });
  }

  async replyComment(commentId: string, message: string): Promise<{ id: string }> {
    return this.request<{ id: string }>(`${commentId}/comments`, 'POST', { message });
  }

  async deleteComment(commentId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(commentId, 'DELETE');
  }

  async hideComment(commentId: string, isHidden: boolean): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(commentId, 'POST', { is_hidden: isHidden });
  }

  // ========== Photos (3) ==========

  async uploadPhoto(pageId: string, url: string, caption?: string, published?: boolean): Promise<{ id: string; post_id?: string }> {
    const body: Record<string, unknown> = { url };
    if (caption) body.message = caption;
    if (published !== undefined) body.published = published;
    return this.request<{ id: string; post_id?: string }>(`${pageId}/photos`, 'POST', body);
  }

  async listPhotos(pageId: string, limit?: number): Promise<FacebookPhoto[]> {
    const params: Record<string, string> = { fields: 'id,name,link,created_time,images' };
    if (limit) params.limit = String(limit);
    const res = await this.request<GraphApiResponse<FacebookPhoto>>(`${pageId}/photos`, 'GET', undefined, params);
    return res.data || [];
  }

  async deletePhoto(photoId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(photoId, 'DELETE');
  }

  // ========== Videos (3) ==========

  async uploadVideo(pageId: string, fileUrl: string, title?: string, description?: string): Promise<{ id: string }> {
    const body: Record<string, unknown> = { file_url: fileUrl };
    if (title) body.title = title;
    if (description) body.description = description;
    return this.request<{ id: string }>(`${pageId}/videos`, 'POST', body);
  }

  async listVideos(pageId: string, limit?: number): Promise<FacebookVideo[]> {
    const params: Record<string, string> = { fields: 'id,title,description,created_time,length,source' };
    if (limit) params.limit = String(limit);
    const res = await this.request<GraphApiResponse<FacebookVideo>>(`${pageId}/videos`, 'GET', undefined, params);
    return res.data || [];
  }

  async deleteVideo(videoId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(videoId, 'DELETE');
  }

  // ========== Insights (4) ==========

  async getPageInsights(pageId: string, metric: string, period?: string, since?: string, until?: string): Promise<FacebookInsight[]> {
    const params: Record<string, string> = { metric };
    if (period) params.period = period;
    if (since) params.since = since;
    if (until) params.until = until;
    const res = await this.request<GraphApiResponse<FacebookInsight>>(`${pageId}/insights`, 'GET', undefined, params);
    return res.data || [];
  }

  async getPostInsights(postId: string, metric: string): Promise<FacebookInsight[]> {
    const params: Record<string, string> = { metric };
    const res = await this.request<GraphApiResponse<FacebookInsight>>(`${postId}/insights`, 'GET', undefined, params);
    return res.data || [];
  }

  async getPageFans(pageId: string): Promise<FacebookInsight[]> {
    const params: Record<string, string> = { metric: 'page_fans', period: 'day' };
    const res = await this.request<GraphApiResponse<FacebookInsight>>(`${pageId}/insights`, 'GET', undefined, params);
    return res.data || [];
  }

  async getPageViews(pageId: string, period?: string): Promise<FacebookInsight[]> {
    const params: Record<string, string> = { metric: 'page_views_total', period: period || 'day' };
    const res = await this.request<GraphApiResponse<FacebookInsight>>(`${pageId}/insights`, 'GET', undefined, params);
    return res.data || [];
  }

  // ========== Conversations (4) ==========

  async listConversations(pageId: string, limit?: number): Promise<FacebookConversation[]> {
    const params: Record<string, string> = { fields: 'id,updated_time,snippet,message_count,participants' };
    if (limit) params.limit = String(limit);
    const res = await this.request<GraphApiResponse<FacebookConversation>>(`${pageId}/conversations`, 'GET', undefined, params);
    return res.data || [];
  }

  async getMessages(conversationId: string, limit?: number): Promise<FacebookMessage[]> {
    const params: Record<string, string> = { fields: 'id,message,from,created_time' };
    if (limit) params.limit = String(limit);
    const res = await this.request<GraphApiResponse<FacebookMessage>>(`${conversationId}/messages`, 'GET', undefined, params);
    return res.data || [];
  }

  async sendMessage(pageId: string, recipientId: string, text: string): Promise<{ recipient_id: string; message_id: string }> {
    return this.request<{ recipient_id: string; message_id: string }>(
      `${pageId}/messages`,
      'POST',
      { recipient: { id: recipientId }, message: { text }, messaging_type: 'RESPONSE' }
    );
  }

  async sendTyping(pageId: string, recipientId: string, action: string = 'typing_on'): Promise<{ recipient_id: string }> {
    return this.request<{ recipient_id: string }>(
      `${pageId}/messages`,
      'POST',
      { recipient: { id: recipientId }, sender_action: action }
    );
  }
}
