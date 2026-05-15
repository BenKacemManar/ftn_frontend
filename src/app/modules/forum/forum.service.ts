import { Injectable } from '@angular/core';

export interface Reply {
    id: number;
    topicId: number;
    parentId: number | null;
    author: string;
    content: string;
    createdAt: Date;
    reactionCount: number;
    viewCount: number;
    isPinned?: boolean;
}

export interface Topic {
    id: number;
    title: string;
    description: string;
    category: string;
    author: string;
    createdAt: Date;
    replyCount: number;
    viewCount: number;
    isRepost?: boolean;
    repostAuthor?: string;
}

export interface FlatReply extends Reply {
    depth: number;
}

@Injectable({ providedIn: 'root' })
export class ForumService {
    private topics: Topic[] = [
        { id: 1, title: 'National Championships 2026 - Registration Open', description: 'Registration is now open for the 2026 Tunisian National Swimming Championships. The event will take place from June 15-20 at the Olympic complex in Tunis. All licensed athletes are eligible to participate.', category: 'Competitions', author: 'AdminFTN', createdAt: new Date('2026-01-15'), replyCount: 3, viewCount: 234, isRepost: true, repostAuthor: 'FTN_Official' },
        { id: 2, title: 'Best techniques for butterfly stroke', description: 'Looking for advice on improving my butterfly technique. I struggle with maintaining rhythm throughout 200m. Any drills or tips from experienced swimmers?', category: 'Training', author: 'Swimmer42', createdAt: new Date('2026-02-03'), replyCount: 5, viewCount: 189 },
        { id: 3, title: 'New Olympic-sized pool opens in Tunis', description: 'The city of Tunis has inaugurated a brand new Olympic-sized swimming facility at Parc des Sports. The pool features state-of-the-art timing systems and seating for 2000 spectators.', category: 'News', author: 'FTN_News', createdAt: new Date('2026-03-10'), replyCount: 2, viewCount: 456 },
        { id: 4, title: 'How to improve your freestyle flip turn', description: 'My flip turns are costing me valuable time in races. I lose momentum coming off the wall. Share your best drills and techniques for faster turns.', category: 'Training', author: 'RaceReady', createdAt: new Date('2026-03-22'), replyCount: 4, viewCount: 312 },
        { id: 5, title: 'Upcoming regional meet in Sfax - April 2026', description: 'The regional qualifying meet for the Central-East region will be held in Sfax on April 10-12. This is a qualifier for the National Championships. Registration closes March 25.', category: 'Competitions', author: 'CoachAhmed', createdAt: new Date('2026-03-01'), replyCount: 3, viewCount: 167 },
        { id: 6, title: 'Share your favorite swimming moments', description: 'A fun thread! Share your most memorable moments in the pool. Whether it is your first race, a personal best, or just a great training session with friends.', category: 'General', author: 'WaterLover', createdAt: new Date('2026-02-18'), replyCount: 8, viewCount: 423 },
        { id: 7, title: 'Open water swimming preparation guide', description: 'I am training for my first open water event. What are the key differences from pool swimming? Any advice on sighting, navigation, and wetsuit selection?', category: 'Training', author: 'OpenWaterNewb', createdAt: new Date('2026-04-01'), replyCount: 6, viewCount: 278 },
        { id: 8, title: 'Youth development program announced', description: 'The Federation is launching a new youth development program for swimmers aged 10-14. The program includes monthly training camps, nutrition workshops, and mental coaching sessions.', category: 'News', author: 'FTN_News', createdAt: new Date('2026-04-05'), replyCount: 1, viewCount: 534 }
    ];

    private replies: Reply[] = [
        { id: 1, topicId: 1, parentId: null, author: 'YoungSwimmer', content: 'When is the registration deadline? I want to make sure I submit my forms on time.', createdAt: new Date('2026-01-16'), reactionCount: 2, viewCount: 45 },
        { id: 2, topicId: 1, parentId: 1, author: 'AdminFTN', content: 'The deadline is March 31, 2026. Make sure to have your medical certificate and license ready before submitting.', createdAt: new Date('2026-01-16'), reactionCount: 5, viewCount: 67, isPinned: true },
        { id: 3, topicId: 1, parentId: 2, author: 'YoungSwimmer', content: 'Thank you for the quick reply! I will get everything ready this week.', createdAt: new Date('2026-01-17'), reactionCount: 1, viewCount: 23 },
        { id: 4, topicId: 1, parentId: null, author: 'MasterSwim', content: 'What are the age categories for this year? Have they changed from last season?', createdAt: new Date('2026-01-18'), reactionCount: 3, viewCount: 34 },
        { id: 5, topicId: 1, parentId: 4, author: 'AdminFTN', content: 'Categories remain the same: U14 (2012-2013), U16 (2010-2011), U18 (2008-2009), and Senior (2007 and older).', createdAt: new Date('2026-01-18'), reactionCount: 4, viewCount: 56 },
        { id: 6, topicId: 2, parentId: null, author: 'CoachKarim', content: 'The key to the 200m butterfly is pacing. Try doing 8x50m on 1:30 at race pace with full recovery. Focus on long strokes and bilateral breathing.', createdAt: new Date('2026-02-04'), reactionCount: 7, viewCount: 89 },
        { id: 7, topicId: 2, parentId: null, author: 'ProSwinner', content: 'Underwater dolphin kicks off every wall make a huge difference. Practice your streamline and kick timing.', createdAt: new Date('2026-02-05'), reactionCount: 6, viewCount: 78 },
        { id: 8, topicId: 2, parentId: 7, author: 'Swimmer42', content: 'Thanks! How many kicks do you recommend off each wall?', createdAt: new Date('2026-02-05'), reactionCount: 1, viewCount: 34 },
        { id: 9, topicId: 2, parentId: 8, author: 'ProSwinner', content: 'For 200m fly, aim for 3-5 kicks per wall. Any more and you will fatigue too quickly.', createdAt: new Date('2026-02-06'), reactionCount: 4, viewCount: 45 },
        { id: 10, topicId: 2, parentId: null, author: 'DrillMaster', content: 'Try the fist drill for butterfly. Swimming with clenched fists forces you to use your forearms to pull. It really improves feel for the water.', createdAt: new Date('2026-02-07'), reactionCount: 3, viewCount: 56 },
        { id: 11, topicId: 3, parentId: null, author: 'TunisFan', content: 'Great news! Does anyone know if the pool will be open for public training sessions?', createdAt: new Date('2026-03-11'), reactionCount: 2, viewCount: 67 },
        { id: 12, topicId: 3, parentId: 11, author: 'FTN_News', content: 'Yes, public hours will be available daily from 6-8 AM and 7-10 PM. Club training blocks are scheduled in between. A membership card is required.', createdAt: new Date('2026-03-11'), reactionCount: 5, viewCount: 89 },
        { id: 13, topicId: 4, parentId: null, author: 'FlipKing', content: 'The most important thing is to keep your core tight during the flip. A loose body loses momentum. Practice somersaults on dry land first.', createdAt: new Date('2026-03-23'), reactionCount: 8, viewCount: 102 },
        { id: 14, topicId: 4, parentId: null, author: 'TechSwim', content: 'Try the "no breath" turn drill: swim 25m, flip turn, push off, take 3 strokes, then flip again. This forces you to nail the turn without rushing for air.', createdAt: new Date('2026-03-24'), reactionCount: 6, viewCount: 78 },
        { id: 15, topicId: 4, parentId: null, author: 'RaceReady', content: 'These are all great tips! I will try the dry land somersaults this week.', createdAt: new Date('2026-03-25'), reactionCount: 1, viewCount: 34 },
        { id: 16, topicId: 4, parentId: 13, author: 'CoachSami', content: 'Adding to this: keep your chin tucked and spot the wall at the same spot every time. Consistency is key for fast turns.', createdAt: new Date('2026-03-24'), reactionCount: 4, viewCount: 56 },
        { id: 17, topicId: 5, parentId: null, author: 'SfaxSwim', content: 'Will there be events for para-swimmers at this meet?', createdAt: new Date('2026-03-02'), reactionCount: 1, viewCount: 23 },
        { id: 18, topicId: 5, parentId: 17, author: 'CoachAhmed', content: 'Yes, there will be para-swimming events. Please contact the regional committee for classification details.', createdAt: new Date('2026-03-02'), reactionCount: 3, viewCount: 45 },
        { id: 19, topicId: 5, parentId: null, author: 'TravelSwim', content: 'Are there hotels near the venue that offer discounts for participants?', createdAt: new Date('2026-03-03'), reactionCount: 0, viewCount: 19 },
        { id: 20, topicId: 5, parentId: 19, author: 'CoachAhmed', content: 'The committee has partnered with Hotel Sfax Centre and Hotel Le Tourisme. Mention the meet for a 15% discount.', createdAt: new Date('2026-03-03'), reactionCount: 2, viewCount: 34 },
        { id: 21, topicId: 6, parentId: null, author: 'OldSchoolSwim', content: 'My most memorable moment was winning my first 100m freestyle race at age 12. I still remember the feeling of touching the wall first!', createdAt: new Date('2026-02-19'), reactionCount: 10, viewCount: 134 },
        { id: 22, topicId: 6, parentId: null, author: 'DolphinGirl', content: 'Qualifying for Nationals for the first time last year. I cried happy tears in the pool!', createdAt: new Date('2026-02-20'), reactionCount: 15, viewCount: 156, isPinned: true },
        { id: 23, topicId: 6, parentId: 22, author: 'WaterLover', content: 'That is beautiful! Congratulations on your qualification. What event was it?', createdAt: new Date('2026-02-20'), reactionCount: 3, viewCount: 45 },
        { id: 24, topicId: 6, parentId: 23, author: 'DolphinGirl', content: '200m individual medley! It has always been my favorite event.', createdAt: new Date('2026-02-21'), reactionCount: 7, viewCount: 67 },
        { id: 25, topicId: 6, parentId: null, author: 'NightOwlSwim', content: 'Late night practice sessions with friends. The bonding and team spirit made those 5 AM starts worth it!', createdAt: new Date('2026-02-22'), reactionCount: 6, viewCount: 89 },
        { id: 26, topicId: 7, parentId: null, author: 'OpenWaterPro', content: 'Sighting is the biggest difference. Practice lifting your head every 6-8 strokes to spot your target. In salt water, you float higher which helps.', createdAt: new Date('2026-04-02'), reactionCount: 9, viewCount: 112 },
        { id: 27, topicId: 7, parentId: null, author: 'WetsuitUser', content: 'For wetsuits: make sure it fits snug but allows shoulder rotation. Practice in it at least 3 times before race day.', createdAt: new Date('2026-04-02'), reactionCount: 4, viewCount: 67 },
        { id: 28, topicId: 7, parentId: null, author: 'CurrentSwimmer', content: 'Learn to swim in a straight line without lane ropes. Use landmarks on shore to navigate. And never fight the current - go with it and adjust your angle.', createdAt: new Date('2026-04-03'), reactionCount: 7, viewCount: 89 },
        { id: 29, topicId: 7, parentId: 26, author: 'OpenWaterNewb', content: 'How do you practice sighting in a pool?', createdAt: new Date('2026-04-03'), reactionCount: 1, viewCount: 34 },
        { id: 30, topicId: 7, parentId: 29, author: 'OpenWaterPro', content: 'Try the "Tarzan" drill: swim freestyle with your head always above water. Then alternate 5 strokes normal, 1 sighting stroke. Build up gradually.', createdAt: new Date('2026-04-04'), reactionCount: 5, viewCount: 56 },
        { id: 31, topicId: 8, parentId: null, author: 'ProudParent', content: 'This is wonderful! My daughter is 12 and this program sounds perfect for her. How do we apply?', createdAt: new Date('2026-04-06'), reactionCount: 3, viewCount: 78 },
        { id: 32, topicId: 8, parentId: 31, author: 'FTN_News', content: 'Applications are open on the Federation website until April 30. Selection is based on times, coach recommendation, and an interview.', createdAt: new Date('2026-04-06'), reactionCount: 4, viewCount: 67 },
        { id: 33, topicId: 2, parentId: null, author: 'YoutubeCoach', content: 'I have a great video series on butterfly technique. Search "Butterfly Masterclass" on YouTube. The drill progression really works!', createdAt: new Date('2026-02-08'), reactionCount: 2, viewCount: 45 },
        { id: 34, topicId: 6, parentId: null, author: 'RelayStar', content: 'Breaking the club record in the 4x100m medley relay with my teammates. The four of us trained together for months and it paid off!', createdAt: new Date('2026-02-23'), reactionCount: 12, viewCount: 145 }
    ];

    getTopics(): Topic[] {
        return this.topics;
    }

    getTopicById(id: number): Topic | undefined {
        return this.topics.find(t => t.id === id);
    }

    getFlatReplies(topicId: number): FlatReply[] {
        const topicReplies = this.replies.filter(r => r.topicId === topicId);
        const rootReplies = topicReplies.filter(r => r.parentId === null);
        const result: FlatReply[] = [];

        const traverse = (replies: Reply[], depth: number) => {
            for (const reply of replies) {
                result.push({ ...reply, depth });
                const children = topicReplies.filter(r => r.parentId === reply.id);
                if (children.length > 0) {
                    traverse(children, depth + 1);
                }
            }
        };

        traverse(rootReplies, 0);
        return result;
    }

    incrementReaction(replyId: number): void {
        const reply = this.replies.find(r => r.id === replyId);
        if (reply) {
            reply.reactionCount++;
        }
    }

    addReply(topicId: number, parentId: number | null, author: string, content: string): void {
        const newId = Math.max(...this.replies.map(r => r.id)) + 1;
        this.replies.push({
            id: newId,
            topicId,
            parentId,
            author,
            content,
            createdAt: new Date(),
            reactionCount: 0,
            viewCount: 0
        });
        const topic = this.topics.find(t => t.id === topicId);
        if (topic) topic.replyCount++;
    }

    addTopic(title: string, description: string, category: string, author: string): Topic {
        const newId = Math.max(...this.topics.map(t => t.id)) + 1;
        const topic: Topic = {
            id: newId,
            title,
            description,
            category,
            author,
            createdAt: new Date(),
            replyCount: 0,
            viewCount: 0
        };
        this.topics.push(topic);
        return topic;
    }
}
