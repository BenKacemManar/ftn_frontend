import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ForumCategory, ForumThread, ForumPost, ForumReaction, CreateThreadDto, CreatePostDto } from '../../../core/models/forum.model';

@Injectable({ providedIn: 'root' })
export class ForumService {
  constructor(private api: ApiService) {}

  getCategories(): Observable<ForumCategory[]> {
    return this.api.get<any>('/forums').pipe(map(r => r?.data ?? r));
  }

  getCategoryById(id: number): Observable<ForumCategory> {
    return this.api.get<any>(`/forums/${id}`).pipe(map(r => r?.data ?? r));
  }

  getThreadsByCategory(forumId: number): Observable<ForumThread[]> {
    return this.api.get<any>(`/sujets/forum/${forumId}`).pipe(map(r => Array.isArray(r) ? r : (r?.data ?? [])));
  }

  getThreadById(id: number): Observable<ForumThread> {
    return this.api.get<any>(`/sujets/${id}`).pipe(map(r => r?.data ?? r));
  }

  createThread(dto: CreateThreadDto): Observable<ForumThread> {
    return this.api.post<any>('/sujets', dto).pipe(map(r => r?.data ?? r));
  }

  getPostsByThread(sujetId: number): Observable<ForumPost[]> {
    return this.api.get<any>(`/reponses/sujet/${sujetId}`).pipe(map(r => Array.isArray(r) ? r : (r?.data ?? [])));
  }

  createPost(dto: CreatePostDto): Observable<ForumPost> {
    return this.api.post<any>('/reponses', dto).pipe(map(r => r?.data ?? r));
  }

  reactToPost(postId: number, userId: number, type: string): Observable<ForumReaction> {
    return this.api.post<any>(`/posts/${postId}/react`, { userId, type }).pipe(map(r => r?.data ?? r));
  }

  deleteReaction(id: number): Observable<void> {
    return this.api.delete<void>(`/reactions/${id}`);
  }
}
