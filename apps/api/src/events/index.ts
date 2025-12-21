/*
 * LICENSE PLACEHOLDER
 */

export { default as EventsModule } from './events.module';
export { default as EventsService } from './events.service';
export { default as EventsQueryService } from './events-query.service';
export { default as EventsController } from './events.controller';
export { default as RequestInstrumentationInterceptor } from './interceptors/request-instrumentation.interceptor';
export { default as SkipInstrumentation, SKIP_INSTRUMENTATION_KEY } from './decorators/skip-instrumentation.decorator';
export { default as CorrelationId } from './decorators/correlation-id.decorator';
export { default as EventsApiKeyGuard } from './guards/api-key.guard';
export { default as AggregationWorker } from './workers/aggregation.worker';
export type { AggregatorHandler } from './workers/aggregation.worker';
export { default as BaseAggregator } from './workers/base.aggregator';
export * from './aggregators';
export * from './event-factories';
