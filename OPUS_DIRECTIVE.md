# Report Visualization Implementation Directive

## Context
You are working on a KYC/Survey platform with a Reports module. The Reports system allows users to create surveys with various question types (multiple choice, checkboxes, short answer, linear scale, etc.) and collect responses. Currently, responses are stored but NOT visualized.

## Your Task
Implement comprehensive report response visualizations with BOTH question-level analytics AND aggregate statistics.

## Project Structure
- **Backend**: `/Users/richgodusen/Documents/work/melon-nigeria/melon-core` (NestJS, MongoDB, Mongoose)
- **Frontend**: `/Users/richgodusen/Documents/work/melon-nigeria/melon-web` (Next.js 14, TypeScript, Tailwind CSS)
- **Current Branch**: `feature/report-visualizations`

## Key Files to Reference
- Types: `melon-web/src/types/reports.ts`, `melon-web/src/types/visualization.ts`
- Report Model: `melon-core/src/modules/reports/model/reports.model.ts`
- Reports Service: `melon-core/src/modules/reports/reports.service.ts`
- Reports Controller: `melon-core/src/modules/reports/reports.controller.ts`
- Responses Page: `melon-web/src/app/(dashboard)/reports/[id]/responses/page.tsx`

## What YOU Should Implement (Heavy Lifting)

### 1. Backend - Analytics Aggregation Service

**File**: `melon-core/src/modules/reports/analytics/reports-analytics.service.ts` (NEW)

Implement aggregation methods:

```typescript
// Question-level analytics
async getQuestionAnalytics(reportId: string, questionId: string): Promise<QuestionAnalytics>
  - For MULTIPLE_CHOICE/CHECKBOXES/DROPDOWN: Return option counts, percentages
  - For LINEAR_SCALE/NUMBER: Return min, max, average, median, distribution
  - For SHORT_ANSWER/PARAGRAPH: Return word count stats, common keywords
  - For DATE/TIME: Return distribution over time

// Aggregate statistics
async getReportAnalytics(reportId: string): Promise<ReportAnalytics>
  - Total responses over time (daily/weekly breakdown)
  - Completion rate (started vs completed)
  - Average completion time
  - Response rate trends
  - Peak response times
  - Geographic distribution (if IP data available)

// Summary for all questions
async getAllQuestionsAnalytics(reportId: string): Promise<QuestionAnalytics[]>
  - Loop through all questions and return analytics for each
```

**Key Requirements**:
- Use MongoDB aggregation pipelines for efficiency
- Cache results for 5 minutes to reduce DB load
- Handle empty responses gracefully
- Return consistent data structures for all question types

### 2. Backend - Controller Endpoints

**File**: `melon-core/src/modules/reports/reports.controller.ts` (MODIFY)

Add these endpoints:

```typescript
@Get(':id/analytics/overview')
async getReportAnalytics(@Param('id') id: string, @Request() req)
  - Returns aggregate statistics for the entire report

@Get(':id/analytics/questions')
async getAllQuestionsAnalytics(@Param('id') id: string, @Request() req)
  - Returns analytics for all questions in the report

@Get(':id/analytics/questions/:questionId')
async getQuestionAnalytics(@Param('id') id: string, @Param('questionId') questionId: string, @Request() req)
  - Returns detailed analytics for a specific question
```

### 3. Backend - Response Models/Types

**File**: `melon-core/src/modules/reports/dto/analytics-response.dto.ts` (NEW)

Define response DTOs:

```typescript
export class QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  totalResponses: number;

  // For choice-based questions
  optionBreakdown?: Array<{
    option: string;
    count: number;
    percentage: number;
  }>;

  // For numeric questions
  numericStats?: {
    min: number;
    max: number;
    average: number;
    median: number;
    distribution: Array<{ range: string; count: number }>;
  };

  // For text questions
  textStats?: {
    avgWordCount: number;
    totalWords: number;
    commonKeywords: Array<{ word: string; count: number }>;
  };

  // For date/time questions
  timeDistribution?: Array<{
    period: string; // e.g., "2024-01-01" or "14:00"
    count: number;
  }>;
}

export class ReportAnalytics {
  totalResponses: number;
  completedResponses: number;
  partialResponses: number;
  completionRate: number;

  responsesOverTime: Array<{
    date: string;
    count: number;
  }>;

  avgCompletionTimeSeconds?: number;

  peakResponseTimes?: Array<{
    hour: number;
    count: number;
  }>;

  geographicDistribution?: Array<{
    country: string;
    count: number;
  }>;
}
```

### 4. Frontend - API Client Functions

**File**: `melon-web/src/lib/api/reports.ts` (MODIFY)

Add API client functions:

```typescript
export async function getReportAnalytics(reportId: string): Promise<ReportAnalytics>
export async function getAllQuestionsAnalytics(reportId: string): Promise<QuestionAnalytics[]>
export async function getQuestionAnalytics(reportId: string, questionId: string): Promise<QuestionAnalytics>
```

### 5. Frontend - Chart Components

**File**: `melon-web/src/components/reports/charts/` (NEW DIRECTORY)

Create reusable chart components using **Recharts** library:

```
charts/
  ├── BarChart.tsx          - For choice-based questions
  ├── LineChart.tsx         - For trends over time
  ├── PieChart.tsx          - For proportions
  ├── AreaChart.tsx         - For volume over time
  ├── StatCard.tsx          - For displaying key metrics
  └── ChartContainer.tsx    - Wrapper with loading/error states
```

**Requirements**:
- Install recharts: `npm install recharts --legacy-peer-deps`
- Responsive design (mobile-friendly)
- Consistent color scheme (use primary brand color #5B94E5)
- Include tooltips and legends
- Handle empty data states

### 6. Frontend - Analytics Components

**File**: `melon-web/src/components/reports/analytics/` (NEW DIRECTORY)

Create analytics display components:

```
analytics/
  ├── QuestionAnalyticsCard.tsx    - Shows analytics for one question
  ├── OverviewStats.tsx             - Shows aggregate stats (total responses, completion rate, etc.)
  ├── ResponseTrends.tsx            - Shows responses over time line chart
  ├── QuestionBreakdown.tsx         - Shows all questions analytics in a grid
  └── AnalyticsEmpty.tsx            - Empty state when no responses
```

### 7. Frontend - Update Responses Page

**File**: `melon-web/src/app/(dashboard)/reports/[id]/responses/page.tsx` (MODIFY)

Implement the **analytics** tab:

```typescript
{activeTab === 'analytics' && (
  <div className="space-y-6">
    <OverviewStats reportId={reportId} />
    <ResponseTrends reportId={reportId} />
    <QuestionBreakdown reportId={reportId} />
  </div>
)}
```

Add hooks:
```typescript
const { analytics, loading: analyticsLoading } = useReportAnalytics(reportId);
const { questionAnalytics, loading: questionsLoading } = useQuestionsAnalytics(reportId);
```

### 8. Frontend - Custom Hooks

**File**: `melon-web/src/hooks/useReportAnalytics.ts` (NEW)

```typescript
export function useReportAnalytics(reportId: string) {
  // Fetch report-level analytics
}

export function useQuestionsAnalytics(reportId: string) {
  // Fetch all questions analytics
}

export function useQuestionAnalytics(reportId: string, questionId: string) {
  // Fetch single question analytics
}
```

## Implementation Order

1. Backend analytics service (aggregation logic)
2. Backend controller endpoints
3. Backend DTOs
4. Frontend API client functions
5. Install recharts library
6. Frontend chart components (start with BarChart, PieChart, LineChart)
7. Frontend analytics components
8. Frontend hooks
9. Update responses page to use analytics tab
10. Test with sample data

## Data Requirements

**Test the implementation with**:
- Reports with 0 responses (empty state)
- Reports with 1-5 responses
- Reports with 100+ responses
- All question types
- Mix of complete and partial responses

## Important Notes

- Use existing patterns from the codebase (check how KYC stats are implemented)
- Follow the existing auth patterns (`@UseGuards(JwtAuthGuard)`)
- Use existing UI components from `melon-web/src/components/ui/`
- Match the existing design system (colors, spacing, typography)
- Add proper TypeScript types for everything
- Handle errors gracefully with try-catch blocks
- Add loading states for all async operations

## What NOT to Do

- Don't implement export functionality yet (will be added later)
- Don't add filtering by date range yet (will be added later)
- Don't implement real-time updates (will be added later)
- Don't modify the existing report builder or response submission flow

## Expected Deliverables

1. Working analytics endpoints in backend
2. Working chart components in frontend
3. Fully functional analytics tab in responses page
4. All TypeScript types properly defined
5. Basic error handling and loading states
6. Code that builds without errors

## Success Criteria

- I can view aggregate statistics (total responses, completion rate, trends)
- I can see analytics for each question based on its type
- Charts render correctly with real data
- Empty states display when there are no responses
- Loading states display while fetching data
- No TypeScript errors
- Both frontend and backend build successfully

---

**After you complete this, I (Claude Code Sonnet) will handle:**
- Polish and styling refinements
- Advanced error states
- Performance optimizations
- Edge case handling
- Final integration testing
- Documentation
