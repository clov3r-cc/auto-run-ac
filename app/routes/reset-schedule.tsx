import { href, redirect } from 'react-router';
import { schedule } from 'lib/kv/schedule.ts';
import { jstDate } from 'lib/utils/date.ts';
import type { Route } from '../+types/root';

import { getDateParamsFromUrl } from '~/lib/req.ts';

export async function action({
  context: {
    cloudflare: {
      env: { KV__SCHEDULES },
    },
  },
  request,
}: Route.ActionArgs) {
  const url = new URL(request.url);
  const dateParams = getDateParamsFromUrl(url);

  if (!dateParams) {
    return redirect(href('/'));
  }

  const date = jstDate(
    new Date(dateParams.year, dateParams.month - 1, dateParams.day),
  );

  const kv = schedule(KV__SCHEDULES);
  await kv.reset(date);

  return redirect(href('/'));
}
