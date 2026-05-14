import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './tasks/task.entity';
import { TasksModule } from './tasks/tasks.module';

import { Note } from './notes/note.entity';
import { NotesModule } from './notes/notes.module';
import { AiProxyModule } from './revision/ai/ai-proxy.module';

import { StudyModule } from './modules/module.entity';
import { ModulesModule } from './modules/modules.module';
import { DocumentsModule } from './documents/documents.module';
import { Document } from './documents/document.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { VerificationCode } from './auth/VerificationCode.entity';
import { TimerSessionsModule } from './timer/timer-session.module';
import { TimerSession } from './timer/timer-session.entity';
import { ProgressModule } from './progress/progress.module';
import { StudySession } from './progress/entities/study-session.entity';
import { Goal } from './progress/entities/goal.entity';
import { FlashcardsModule } from './revision/flashcards/flashcards.module';
import { Flashcard } from './revision/flashcards/flashcard.entity';
import { QuizModule } from './revision/quiz/quiz.module';
import { QuizQuestion } from './revision/quiz/quiz-question.entity';
import { QuizOption } from './revision/quiz/quiz-option.entity';
import { SessionsModule } from './revision/sessions/sessions.module';
import { RevisionSession } from './revision/sessions/revision-session.entity';
import { CardProgress } from './revision/progress/card-progress.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USERNAME ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_DATABASE ?? 'studycore',
      
      charset: 'utf8mb4',
      entities: [
        Task,
        Note,
        StudyModule,
        Document,
        User,
        VerificationCode,
        TimerSession,
        StudySession,
        Goal,
        Flashcard,
        QuizQuestion,
        QuizOption,
        RevisionSession,
        CardProgress,
      ],
      autoLoadEntities: true,
      synchronize: true,
    }),
    TasksModule,
    NotesModule,
    ModulesModule,
    DocumentsModule,
    UsersModule,
    AuthModule,
    TimerSessionsModule,
    ProgressModule,
    FlashcardsModule,
    QuizModule,
    SessionsModule,
    AiProxyModule,

  ],
})
export class AppModule {}
