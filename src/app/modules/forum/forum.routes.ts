import { Routes } from '@angular/router';
import { ForumHome } from './forum-home/forum-home';
import { ForumTopic } from './forum-topic/forum-topic';

export default [
    { path: '', component: ForumHome },
    { path: 'topic/:id', component: ForumTopic }
] as Routes;
