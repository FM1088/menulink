-- Page Analytics Events table
-- Tracks individual page views and link clicks with timestamps

create table if not exists page_analytics (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references pages(id) on delete cascade not null,
  event_type text not null check (event_type in ('view', 'click')),
  link_id text, -- null for views, populated for clicks
  referrer text,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Index for querying by page and time
create index if not exists page_analytics_page_created_idx on page_analytics(page_id, created_at);
create index if not exists page_analytics_event_type_idx on page_analytics(event_type);

-- Function to record analytics events
create or replace function record_analytics(
  p_page_id uuid,
  p_event_type text,
  p_link_id text default null,
  p_referrer text default null,
  p_user_agent text default null
) returns void as $$
begin
  insert into page_analytics (page_id, event_type, link_id, referrer, user_agent)
  values (p_page_id, p_event_type, p_link_id, p_referrer, p_user_agent);
  
  -- Also update the aggregate counters on the pages table
  if p_event_type = 'view' then
    update pages set views = coalesce(views, 0) + 1 where id = p_page_id;
  elsif p_event_type = 'click' then
    update pages set clicks = coalesce(clicks, 0) + 1 where id = p_page_id;
  end if;
end;
$$ language plpgsql security definer;

-- Function to get analytics summary by day
create or replace function get_analytics_summary(
  p_page_id uuid,
  p_days int default 30
) returns table (
  date date,
  views bigint,
  clicks bigint
) as $$
begin
  return query
  select
    d.date,
    coalesce(sum(case when pa.event_type = 'view' then 1 else 0 end), 0)::bigint as views,
    coalesce(sum(case when pa.event_type = 'click' then 1 else 0 end), 0)::bigint as clicks
  from (
    select generate_series(
      (current_date - (p_days - 1) * interval '1 day')::date,
      current_date,
      '1 day'::interval
    )::date as date
  ) d
  left join page_analytics pa on date_trunc('day', pa.created_at)::date = d.date
    and pa.page_id = p_page_id
  group by d.date
  order by d.date;
end;
$$ language plpgsql security definer;
