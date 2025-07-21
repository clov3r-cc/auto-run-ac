import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/dashboard.tsx'),
  route('edit', 'routes/edit-schedule.tsx'),
  route('reset', 'routes/reset-schedule.tsx'),
] satisfies RouteConfig;
