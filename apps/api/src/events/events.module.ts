/*
 * LICENSE PLACEHOLDER
 */

import { Module, forwardRef } from '@nestjs/common';
import EventsController from './events.controller';
import EventsService from './events.service';
import EventsQueryService from './events-query.service';
import EventsMetrics from './events.metrics';
import RequestInstrumentationInterceptor from './interceptors/request-instrumentation.interceptor';
import AggregationWorker from './workers/aggregation.worker';
import LastSeenAggregator from './aggregators/last-seen.aggregator';
import CountsAggregator from './aggregators/counts.aggregator';
import CommunicationsAggregator from './aggregators/communications.aggregator';
import CalendarAggregator from './aggregators/calendar.aggregator';
import CorrelationAggregator from './aggregators/correlation.aggregator';
import ConferencesAggregator from './aggregators/conferences.aggregator';
import CrossAppAggregator from './aggregators/cross-app.aggregator';
import RecommendationsModule from '../recommendations/recommendations.module';
import { CrossAppModule } from '../recommendations/rules/cross-app';

@Module({
  imports: [forwardRef(() => RecommendationsModule), CrossAppModule],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventsQueryService,
    EventsMetrics,
    RequestInstrumentationInterceptor,
    AggregationWorker,
    LastSeenAggregator,
    CountsAggregator,
    CommunicationsAggregator,
    CalendarAggregator,
    CorrelationAggregator,
    ConferencesAggregator,
    CrossAppAggregator,
  ],
  exports: [EventsService, EventsQueryService, EventsMetrics, RequestInstrumentationInterceptor, AggregationWorker],
})
export default class EventsModule {}
