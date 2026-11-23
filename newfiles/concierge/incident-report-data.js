/* Concierge incident report logic (localStorage).
   Requires: shared/utils.js, shared/mockdata.js (getCurrentConcierge). */

const INCIDENT_STORAGE_KEY = 'mysuite-concierge-incidents-v2';

const INCIDENT_SEED = [
  {
    id: 'inc-seed-1',
    occurredAt: '2026-11-12T08:40:00',
    location: 'Lobby',
    type: 'Noise',
    description: "A resident from Suite 402 approached the concierge desk at approximately 8:40 a.m. to report loud music coming from the elevator waiting area. The resident said the noise had been noticeable for about fifteen minutes and was making it difficult to speak with visitors in the lobby. Concierge attended the area and confirmed that music was playing from a portable speaker beside the seating area. Several residents were waiting for elevators at the time, and one visitor had moved closer to the entrance to take a phone call.\n\nThe person using the speaker was asked to lower the volume and reminded that shared spaces must remain comfortable for residents and guests. They cooperated immediately, turned the speaker off, and moved their belongings away from the elevator doors. Concierge checked that the hallway and elevator access routes were clear, then returned to the desk. No argument, damage, or safety concern was observed during the interaction. The resident who initially reported the issue was advised that the noise had stopped and thanked staff for responding.\n\nA second check was completed at 9:00 a.m. and the lobby remained quiet. The concern was included in the shift handover so the next concierge could watch for recurring noise during busy periods. Management can review the report if further complaints are received. No additional action was required at the time this entry was written.",
    peopleInvolved: 'Suite 402',
    reportedBy: 'Jordan Kim',
    createdAt: '2026-11-12T08:45:00'
  },
  {
    id: 'inc-seed-2',
    occurredAt: '2026-11-11T19:15:00',
    location: 'Parking garage P2',
    type: 'Property damage',
    description: "During the evening parking garage patrol, concierge noticed that the passenger-side mirror of a vehicle near stall 48 on P2 appeared damaged. Small fragments were visible on the floor beside the parking space, and the mirror housing was resting against the vehicle door. No one was present at the stall when the damage was first observed. The neighbouring access lane was checked for debris and remained passable.\n\nConcierge took photographs of the vehicle, the surrounding floor, and the stall number for management to review. Loose fragments were moved out of the driving lane without touching the vehicle. The resident associated with the parking space was contacted through the building's usual process and advised to inspect their vehicle. Staff did not identify a cause or make any determination about responsibility.\n\nThe location and approximate discovery time were recorded so management could assess whether further follow-up was needed. A reminder was left in the shift handover to direct any enquiries about the damage to management. No injuries, active leaks, or continuing hazards were observed during the patrol.",
    peopleInvolved: '',
    reportedBy: 'Aisha Lawal',
    createdAt: '2026-11-11T19:22:00'
  },
  {
    id: 'inc-seed-3',
    occurredAt: '2026-11-10T14:05:00',
    location: 'Amenity lounge',
    type: 'Safety',
    description: "Concierge attended the amenity lounge after a resident reported a spill near the coffee station. Water and coffee had spread across the tiled area between the counter and the nearest seating table. The floor was visibly wet, and several residents were using the lounge. Staff asked people to use the opposite side of the room while the area was made safe.\n\nWarning cones were placed at both approaches to the coffee station. The spill was cleaned with the available supplies, and the nearby furniture was checked for moisture. A small amount of liquid underneath the counter was also removed. The resident who reported the spill confirmed that they had not fallen and did not need assistance. No damage to the coffee machine or electrical outlets was visible.\n\nAfter allowing the floor to dry, concierge returned to check the surface before removing the cones. The area was reopened once it was dry and clear of cleaning equipment. The next shift was asked to keep an eye on the station during the afternoon gathering, when increased use was expected.",
    peopleInvolved: '',
    reportedBy: 'Jordan Kim',
    createdAt: '2026-11-10T14:10:00'
  },
  {
    id: 'inc-seed-4',
    occurredAt: '2025-08-22T16:30:00',
    location: 'Loading bay',
    type: 'Safety',
    description: "A delivery cart was found unattended in the loading bay during the afternoon inspection. It was positioned across part of the marked pedestrian route and reduced the clear space beside the exit door. Two boxes had also been left beside the cart. No delivery personnel were immediately visible, and the exit door could not be approached using the usual marked path.\n\nConcierge moved the cart and boxes to the designated waiting area so the exit route was fully clear. The delivery driver returned a few minutes later and was shown the approved staging location. Staff explained that delivery equipment must not obstruct doors, pedestrian routes, or emergency access, even during a short delivery. The driver acknowledged the instruction and completed the delivery without further difficulty.\n\nThe loading bay was inspected again after the vehicle left. The route remained clear and no damage was found. The vendor name and approximate delivery time were provided to management for reference if a similar concern arose. The handover noted that extra checks may be useful during periods with several simultaneous deliveries.",
    peopleInvolved: '',
    reportedBy: 'Alsina Butt',
    status: 'archived',
    createdAt: '2025-08-22T16:40:00'
  },
  {
    id: 'inc-seed-5',
    occurredAt: '2025-03-04T09:10:00',
    location: 'Suite 808 hallway',
    type: 'Noise',
    description: "A resident reported repeated drilling and hammering near Suite 808 before the building's permitted construction hours. Concierge attended the eighth-floor hallway and heard intermittent drilling from inside the suite. The corridor was clear, although tools and protective coverings were visible immediately inside the open door. The reporting resident said the noise had disturbed their morning and asked staff to address the timing.\n\nThe contractor was advised to stop noisy work until the permitted start time and to check the building's renovation instructions before resuming. The contractor said the work was part of a scheduled repair and agreed to pause the equipment. Concierge reminded the team that materials must remain within the suite and that hallway protection should not block access for neighbouring residents.\n\nA follow-up visit confirmed that the noisy work had stopped. The reporting resident was updated, and management was sent the relevant details for any renovation coordination that might be required. The next shift was asked to note any further complaints from the same area. No damage, blocked exit, or immediate safety issue was observed.",
    peopleInvolved: 'Suite 808',
    reportedBy: 'Jordan Kim',
    status: 'archived',
    createdAt: '2025-03-04T09:18:00'
  },
  {"id": "inc-seed-6", "occurredAt": "2026-11-18T08:10:00", "location": "Main entrance", "type": "Safety", "description": "The automatic entrance door paused halfway through opening during the morning arrivals. Concierge directed residents to the adjacent door and checked that the entrance remained accessible. The door was left out of automatic operation while maintenance inspected the sensor.\n\nMaintenance cleaned the sensor area and tested several opening cycles. Normal operation resumed after the checks. No injury or damage was reported, and the next shift was asked to watch for any recurrence.", "peopleInvolved": "", "reportedBy": "Shahzeb", "createdAt": "2026-11-18T08:10:00"},
  {"id": "inc-seed-7", "occurredAt": "2026-11-17T20:35:00", "location": "Visitor parking", "type": "Parking", "description": "A visitor vehicle was parked across the lines of stall 12 and partially occupied the neighbouring space. Concierge checked the visitor registration and contacted the hosting resident to request that the vehicle be repositioned. The driving lane remained clear throughout.\n\nThe visitor returned and moved the vehicle fully inside the marked space. Staff completed a follow-up walk through the parking area and found no further obstruction. The resident was reminded to share the parking instructions with future guests.", "peopleInvolved": "Visitor stall 12", "reportedBy": "Alsina Butt", "createdAt": "2026-11-17T20:35:00"},
  {"id": "inc-seed-8", "occurredAt": "2026-11-17T15:20:00", "location": "Floor 6 hallway", "type": "Water leak", "description": "A resident reported a small pool of water outside Suite 604. Concierge placed a warning sign nearby and contacted maintenance to investigate. The water had reached the edge of the carpet but had not travelled toward the elevator lobby.\n\nMaintenance attended and spoke with the resident about a leaking appliance connection. The immediate source was isolated and the wet area was dried. Management was advised to arrange a follow-up inspection of the hallway carpet and confirm whether additional drying was needed.", "peopleInvolved": "Suite 604", "reportedBy": "Jordan Kim", "createdAt": "2026-11-17T15:20:00"},
  {"id": "inc-seed-9", "occurredAt": "2026-11-16T22:10:00", "location": "Common area", "type": "Noise", "description": "Concierge received a call about raised voices from a gathering in the common area. Staff attended and found that the booked event was finishing, with guests moving chairs and speaking near the open hallway door. The organizer was asked to close the door and reduce the noise during cleanup.\n\nThe organizer cooperated and the remaining guests departed shortly afterwards. Concierge checked that the room was secure, rubbish had been removed, and the adjacent corridor was clear. No further complaints were received that evening.", "peopleInvolved": "", "reportedBy": "Shahzeb", "createdAt": "2026-11-16T22:10:00"},
  {"id": "inc-seed-10", "occurredAt": "2026-11-16T11:45:00", "location": "Mail room", "type": "Property damage", "description": "A loose mailbox door was observed during a routine inspection of the mail room. The hinge appeared displaced, although the mailbox remained closed. Concierge documented the condition and notified management without opening or handling any mail.\n\nThe affected resident was advised to contact the desk if access was difficult. A repair request was sent to maintenance and the surrounding boxes were checked for visible damage. No other concerns were identified, and the area remained available for normal use.", "peopleInvolved": "", "reportedBy": "Aisha Lawal", "createdAt": "2026-11-16T11:45:00"},
  {"id": "inc-seed-11", "occurredAt": "2026-11-15T18:30:00", "location": "Pool entrance", "type": "Safety", "description": "Water was collecting immediately outside the pool entrance as residents returned to the change rooms. Concierge placed a caution sign and asked users to take care while the entrance was cleaned. The floor drain was checked for visible blockage.\n\nThe wet area was dried and a replacement mat was positioned inside the entrance. Staff returned later to confirm that the mat was secure and the corridor remained dry. The pool remained open because access could be maintained safely during cleanup.", "peopleInvolved": "", "reportedBy": "Alsina Butt", "createdAt": "2026-11-15T18:30:00"},
  {"id": "inc-seed-12", "occurredAt": "2026-11-15T09:05:00", "location": "Loading bay", "type": "Delivery", "description": "A moving contractor arrived before their reserved loading-bay time and began unloading near the pedestrian route. Concierge explained that the earlier booking was still in progress and asked the crew to wait in the designated holding area. The pedestrian route was cleared immediately.\n\nThe crews coordinated their handover without further delay. Concierge checked the loading area before the second move began and reminded the arriving contractor of the protection and cleanup requirements. Both elevator access and the exit door remained available.", "peopleInvolved": "Moving contractor", "reportedBy": "Jordan Kim", "createdAt": "2026-11-15T09:05:00"},
  {"id": "inc-seed-13", "occurredAt": "2026-11-14T21:15:00", "location": "Garage gate", "type": "Access issue", "description": "The vehicle gate remained open after a resident drove into the garage. Concierge attended the entrance, monitored arriving vehicles, and called the maintenance contact for guidance. No person or object was found obstructing the gate path.\n\nThe gate was reset using the approved procedure and completed a normal opening and closing cycle. Staff continued monitoring for several minutes and recorded the time of the interruption for management. A follow-up inspection was requested because the cause was not confirmed.", "peopleInvolved": "", "reportedBy": "Shahzeb", "createdAt": "2026-11-14T21:15:00"},
  {"id": "inc-seed-14", "occurredAt": "2026-11-13T13:40:00", "location": "Floor 10 elevator lobby", "type": "Safety", "description": "A package trolley was left beside the elevator doors and reduced the clear waiting space for residents. Concierge moved it to the designated service area and checked that neither elevator access nor the corridor was obstructed. No damage was visible on the adjacent walls.\n\nThe trolley was collected by the delivery team later in the shift. Staff reminded them to return shared equipment promptly after use. The elevator lobby was inspected again during the afternoon patrol and remained clear.", "peopleInvolved": "", "reportedBy": "Aisha Lawal", "createdAt": "2026-11-13T13:40:00"},
  {"id": "inc-seed-15", "occurredAt": "2026-11-12T17:55:00", "location": "West stairwell", "type": "Lighting", "description": "A resident reported that one light fixture in the west stairwell was flickering. Concierge checked the landing and confirmed that the neighbouring lights were working, but the affected fixture repeatedly dimmed and restarted. The stairwell remained passable and the handrails were secure.\n\nMaintenance was notified and asked to inspect the fixture. Concierge recorded the floor and landing position to help locate it and included the concern in the handover. A later patrol confirmed that no additional fixtures were affected.", "peopleInvolved": "", "reportedBy": "Alsina Butt", "createdAt": "2026-11-12T17:55:00"}
];

function getIncidents() {
  const stored = readSaved(INCIDENT_STORAGE_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    save(INCIDENT_STORAGE_KEY, INCIDENT_SEED);
    return INCIDENT_SEED.map(item => ({ ...item }));
  }
  const previousSamples = {
  "inc-seed-1": "Resident reported loud music from the elevators area during morning rush.",
  "inc-seed-2": "Vehicle mirror found damaged near stall 48. Photos taken for management.",
  "inc-seed-3": "Wet floor near coffee station after a spill. Area dried and cones placed.",
  "inc-seed-4": "Delivery cart left unattended blocking egress. Moved and vendor reminded of dock rules.",
  "inc-seed-5": "Ongoing construction noise complaint before permitted hours. Contractor advised."
};
  let changed = false;
  const updated = stored.map(item => {
    if (item.description !== previousSamples[item.id]) return item;
    const sample = INCIDENT_SEED.find(seed => seed.id === item.id);
    if (!sample) return item;
    changed = true;
    return { ...item, description: sample.description };
  });
  const expandedSamplesKey = 'mysuite-concierge-incident-extra-samples-v1';
  if (!readSaved(expandedSamplesKey, false)) {
    const ids = new Set(updated.map(item => item.id));
    const extra = INCIDENT_SEED.filter(item => Number(item.id.replace('inc-seed-', '')) >= 6 && !ids.has(item.id));
    if (extra.length) { updated.push(...extra.map(item => ({ ...item }))); changed = true; }
    save(expandedSamplesKey, true);
  }
  if (changed) save(INCIDENT_STORAGE_KEY, updated);
  return updated;
}

function setIncidents(list) {
  save(INCIDENT_STORAGE_KEY, list);
}

function sortIncidentsNewestFirst(list) {
  return [...list].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
}

function incidentYear(incident) {
  const d = new Date(incident.occurredAt);
  return Number.isNaN(d.getTime()) ? null : d.getFullYear();
}

function getIncidentYears(list = getIncidents()) {
  const years = new Set();
  list.forEach(item => {
    const y = incidentYear(item);
    if (y != null) years.add(y);
  });
  years.add(new Date().getFullYear());
  return [...years].sort((a, b) => a - b);
}

function filterIncidentsByYear(list, year) {
  const y = Number(year);
  return list.filter(item => incidentYear(item) === y);
}

function formatIncidentTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatIncidentWhen(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return `${date} · ${formatIncidentTime(iso)}`;
  } catch {
    return '—';
  }
}

function parseIncidentInput(value) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function addIncident(fields) {
  const concierge = getCurrentConcierge();
  const list = getIncidents();
  const entry = {
    id: `inc-${Date.now()}`,
    occurredAt: parseIncidentInput(fields.occurredAt),
    location: String(fields.location || '').trim() || 'Unspecified',
    type: fields.type || 'Other',
    description: String(fields.description || '').trim(),
    peopleInvolved: String(fields.peopleInvolved || '').trim(),
    reportedBy: (fields.reportedBy || concierge?.name || 'Concierge').trim(),
    createdAt: new Date().toISOString()
  };
  list.push(entry);
  setIncidents(list);
  return entry;
}

function escapeIncidentHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function renderIncidentRow(incident) {
  const escape = escapeIncidentHtml;
  const description = String(incident.description || 'No description provided.');
  const people = incident.peopleInvolved
    ? `<div><dt>People involved</dt><dd>${escape(incident.peopleInvolved)}</dd></div>` : '';
  return `<details class="incident-report-disclosure" data-incident-id="${escape(incident.id)}">
    <summary class="incident-row">
      <div class="incident-who"><strong>${escape(incident.type)}</strong><span>${escape(new Date(incident.occurredAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }))}</span><span>${escape(formatIncidentTime(incident.occurredAt))}</span></div>
      <div class="incident-detail"><div class="incident-detail-text"><strong>${escape(incident.location)}</strong><span class="incident-description">${escape(description)}</span></div><dl class="incident-expanded-meta"><div><dt>Written by</dt><dd>${escape(incident.reportedBy || 'Concierge')}</dd></div>${people}</dl></div>
      <span class="incident-expand-label"><span class="incident-label-closed">View details</span><span class="incident-label-open">Hide details</span><span class="incident-expand-chevron" aria-hidden="true">&#8250;</span></span>
    </summary>
  </details>`;
}
