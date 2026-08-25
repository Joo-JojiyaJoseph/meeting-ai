<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\EmailVerificationController;
use App\Http\Controllers\Api\V1\Auth\GoogleAuthController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\AssistantController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DecisionController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\GoogleIntegrationController;
use App\Http\Controllers\Api\V1\MeetingAgendaController;
use App\Http\Controllers\Api\V1\MeetingArtifactController;
use App\Http\Controllers\Api\V1\MeetingController;
use App\Http\Controllers\Api\V1\MeetingIntelligenceController;
use App\Http\Controllers\Api\V1\MeetingParticipantController;
use App\Http\Controllers\Api\V1\MeetingProcessingController;
use App\Http\Controllers\Api\V1\MeetingActionItemController;
use App\Http\Controllers\Api\V1\MeetingDecisionActionController;
use App\Http\Controllers\Api\V1\MemberController;
use App\Http\Controllers\Api\V1\MomController;
use App\Http\Controllers\Api\V1\OrganizationController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\TaskCommentController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Middleware\SetOrganizationContext;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 (Milestone 1: auth + organizations + members)
|--------------------------------------------------------------------------
| Protected routes run auth:sanctum then SetOrganizationContext, so the
| current organization (and its global scope) is established before any
| controller runs.
*/

Route::prefix('v1')->group(function () {

    // ---- Public auth ----
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);

        Route::post('forgot-password', [PasswordResetController::class, 'forgot']);
        Route::post('reset-password', [PasswordResetController::class, 'reset']);

        Route::get('google/redirect', [GoogleAuthController::class, 'redirect']);
        Route::get('google/callback', [GoogleAuthController::class, 'callback']);

        Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
            ->middleware('signed')
            ->name('verification.verify');
    });

    // ---- Authenticated ----
    Route::middleware(['auth:sanctum', SetOrganizationContext::class])->group(function () {

        Route::prefix('auth')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('email/resend', [EmailVerificationController::class, 'resend']);
        });

        // Profile
        Route::get('profile', [ProfileController::class, 'show']);
        Route::patch('profile', [ProfileController::class, 'update']);
        Route::post('profile/change-password', [ProfileController::class, 'changePassword']);

        // Organizations
        Route::get('organizations', [OrganizationController::class, 'index']);
        Route::post('organizations', [OrganizationController::class, 'store']);
        Route::get('organizations/current', [OrganizationController::class, 'current']);
        Route::patch('organizations/{organization}', [OrganizationController::class, 'update']);

        // Members (scoped to the current organization via header X-Organization)
        Route::get('members', [MemberController::class, 'index']);
        Route::post('members', [MemberController::class, 'store']);
        Route::patch('members/{user}', [MemberController::class, 'update']);
        Route::delete('members/{user}', [MemberController::class, 'destroy']);

        // ---- Milestone 2: dashboard, projects, departments, meetings ----

        Route::get('dashboard', [DashboardController::class, 'index']);
        Route::get('analytics', [AnalyticsController::class, 'index']);

        Route::apiResource('projects', ProjectController::class);
        Route::apiResource('departments', DepartmentController::class)->except(['show']);
        Route::get('decisions', [DecisionController::class, 'index']);

        // Meetings
        Route::get('meetings', [MeetingController::class, 'index']);
        Route::post('meetings', [MeetingController::class, 'store']);
        Route::get('meetings/{meeting}', [MeetingController::class, 'show']);
        Route::patch('meetings/{meeting}', [MeetingController::class, 'update']);
        Route::post('meetings/{meeting}/cancel', [MeetingController::class, 'cancel']);
        Route::delete('meetings/{meeting}', [MeetingController::class, 'destroy']);

        // Meeting participants
        Route::get('meetings/{meeting}/participants', [MeetingParticipantController::class, 'index']);
        Route::post('meetings/{meeting}/participants', [MeetingParticipantController::class, 'store']);
        Route::delete('meetings/{meeting}/participants/{participant}', [MeetingParticipantController::class, 'destroy']);

        // Meeting agenda
        Route::get('meetings/{meeting}/agenda', [MeetingAgendaController::class, 'index']);
        Route::post('meetings/{meeting}/agenda', [MeetingAgendaController::class, 'store']);
        Route::post('meetings/{meeting}/agenda/reorder', [MeetingAgendaController::class, 'reorder']);
        Route::patch('meetings/{meeting}/agenda/{agenda}', [MeetingAgendaController::class, 'update']);
        Route::delete('meetings/{meeting}/agenda/{agenda}', [MeetingAgendaController::class, 'destroy']);

        // AI processing pipeline
        Route::post('meetings/{meeting}/artifacts', [MeetingArtifactController::class, 'store']);
        Route::post('meetings/{meeting}/process', [MeetingProcessingController::class, 'store']);
        Route::get('meetings/{meeting}/processing-status', [MeetingProcessingController::class, 'show']);

        // Meeting intelligence (read what the pipeline produced)
        Route::get('meetings/{meeting}/transcript', [MeetingIntelligenceController::class, 'transcript']);
        Route::get('meetings/{meeting}/summary', [MeetingIntelligenceController::class, 'summary']);
        Route::get('meetings/{meeting}/decisions', [MeetingIntelligenceController::class, 'decisions']);
        Route::post('meetings/{meeting}/decisions/{decision}/approve', [MeetingDecisionActionController::class, 'approve']);
        Route::post('meetings/{meeting}/decisions/{decision}/reject', [MeetingDecisionActionController::class, 'reject']);
        Route::get('meetings/{meeting}/actions', [MeetingIntelligenceController::class, 'actionItems']);
        Route::get('meetings/{meeting}/mom', [MeetingIntelligenceController::class, 'mom']);

        // Action item management → task conversion (§25)
        Route::patch('meetings/{meeting}/actions/{actionItem}', [MeetingActionItemController::class, 'update']);
        Route::post('meetings/{meeting}/actions/{actionItem}/accept', [MeetingActionItemController::class, 'accept']);
        Route::post('meetings/{meeting}/actions/{actionItem}/reject', [MeetingActionItemController::class, 'reject']);

        // Tasks (§31)
        Route::apiResource('tasks', TaskController::class);
        Route::get('tasks/{task}/comments', [TaskCommentController::class, 'index']);
        Route::post('tasks/{task}/comments', [TaskCommentController::class, 'store']);
        Route::delete('tasks/{task}/comments/{comment}', [TaskCommentController::class, 'destroy']);

        // MoM editor + approval workflow + export/email (§27–30)
        Route::patch('meetings/{meeting}/mom', [MomController::class, 'update']);
        Route::post('meetings/{meeting}/mom/regenerate', [MomController::class, 'regenerate']);
        Route::post('meetings/{meeting}/mom/approve', [MomController::class, 'approve']);
        Route::post('meetings/{meeting}/mom/reject', [MomController::class, 'reject']);
        Route::post('meetings/{meeting}/mom/publish', [MomController::class, 'publish']);
        Route::get('meetings/{meeting}/mom/export/pdf', [MomController::class, 'exportPdf']);
        Route::get('meetings/{meeting}/mom/export/docx', [MomController::class, 'exportDocx']);
        Route::post('meetings/{meeting}/mom/email', [MomController::class, 'email']);

        // Integrations
        Route::get('integrations/google', [GoogleIntegrationController::class, 'show']);
        Route::delete('integrations/google', [GoogleIntegrationController::class, 'destroy']);

        // AI assistant + organization-wide semantic search (§33, §34)
        Route::post('assistant/ask', [AssistantController::class, 'ask']);
        Route::post('search', [SearchController::class, 'search']);
    });
});
