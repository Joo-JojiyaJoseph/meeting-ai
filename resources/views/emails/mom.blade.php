<x-mail::message>
# Minutes of Meeting

**{{ $meeting->title }}**
{{ optional($meeting->scheduled_start_at)->format('d M Y, H:i') }}

@if($note)
{{ $note }}
@endif

@php $s = $mom->content ?? []; @endphp

@if(!empty($s['executive_summary']))
## Summary
@foreach($s['executive_summary'] as $p)
- {{ $p }}
@endforeach
@endif

@if(!empty($s['decisions']))
## Decisions
@foreach($s['decisions'] as $d)
- {{ $d['decision'] ?? '' }}
@endforeach
@endif

@if(!empty($s['action_items']))
## Action Items
@foreach($s['action_items'] as $a)
- {{ $a['title'] ?? '' }}@if(!empty($a['assignee_name_raw'])) — {{ $a['assignee_name_raw'] }}@endif
@endforeach
@endif

<x-mail::button :url="$url">
View full meeting
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
