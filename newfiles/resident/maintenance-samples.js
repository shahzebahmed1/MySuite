/* Shared resident maintenance examples used by Maintenance and Home. */
function residentMaintenanceExamples(account) {
    const date = daysAgo => new Date(Date.now() - daysAgo * 86400000).toISOString();
    const entries = [
      ['4802', 'Bedroom window latch', 'Doors & windows', 'Bedroom', 'The window latch sticks and does not close fully.', 'in-progress', 7, 'A technician visit is being arranged. Management will confirm the time with you.'],
      ['4803', 'Kitchen tap dripping', 'Plumbing', 'Kitchen', 'The kitchen tap continues dripping after it is turned off.', 'in-progress', 3, 'The maintenance team is reviewing the repair and checking replacement parts.'],
      ['4788', 'Bathroom fan noise', 'Electrical', 'Bathroom', 'The bathroom exhaust fan makes a rattling noise.', 'completed', 18, 'The fan mounting was adjusted and tested.'],
      ['4776', 'Dishwasher not draining', 'Appliances', 'Kitchen', 'Water remains at the bottom after a wash cycle.', 'completed', 31, 'The drain filter was cleaned and the dishwasher is draining normally.'],
      ['4760', 'Living room outlet', 'Electrical', 'Living room', 'One outlet appears to have stopped working.', 'cancelled', 42, 'Request cancelled by the resident.'],
      ['4756', 'Bathroom tap handle loose', 'Plumbing', 'Bathroom', 'The cold water handle turns loosely and needs tightening.', 'completed', 49],
      ['4750', 'Bedroom heating uneven', 'Heating & cooling', 'Bedroom', 'The bedroom stays cooler than the rest of the suite.', 'completed', 56],
      ['4744', 'Kitchen cupboard hinge', 'Other', 'Kitchen', 'The cupboard door above the counter does not close evenly.', 'completed', 63],
      ['4738', 'Balcony door sticking', 'Doors & windows', 'Living room', 'The balcony door is difficult to slide open.', 'cancelled', 70],
      ['4732', 'Bathroom drain slow', 'Plumbing', 'Bathroom', 'The bathroom sink takes several minutes to drain.', 'completed', 77],
      ['4726', 'Fridge door seal', 'Appliances', 'Kitchen', 'The refrigerator door seal is loose along the bottom edge.', 'completed', 84],
      ['4720', 'Ceiling light flickering', 'Electrical', 'Bedroom', 'The ceiling light flickers even after replacing the bulb.', 'completed', 91],
      ['4714', 'Closet door off track', 'Doors & windows', 'Bedroom', 'The sliding closet door has come off its lower track.', 'completed', 98],
      ['4708', 'Thermostat display blank', 'Heating & cooling', 'Living room', 'The thermostat screen is blank and is not responding.', 'cancelled', 105],
      ['4702', 'Shower head leaking', 'Plumbing', 'Bathroom', 'Water leaks around the shower head connection.', 'completed', 112],
      ['4696', 'Oven temperature issue', 'Appliances', 'Kitchen', 'The oven does not appear to reach the selected temperature.', 'completed', 119],
      ['4690', 'Entry door closer', 'Doors & windows', 'Other area', 'The suite entrance door closes too quickly.', 'completed', 400],
      ['4684', 'Vent cover loose', 'Heating & cooling', 'Living room', 'The vent cover rattles when the fan is running.', 'completed', 420],
      ['4678', 'Kitchen light switch', 'Electrical', 'Kitchen', 'The switch feels loose when turning the light on.', 'cancelled', 440],
      ['4672', 'Toilet running', 'Plumbing', 'Bathroom', 'The toilet continues running after the tank has filled.', 'completed', 760],
      ['4666', 'Window weather seal', 'Doors & windows', 'Bedroom', 'A draft is coming through the edge of the bedroom window.', 'completed', 780],
      ['4660', 'Laundry appliance vibration', 'Appliances', 'Other area', 'The washing machine vibrates heavily during the spin cycle.', 'completed', 800]
    ];
    return entries.map(([number, title, category, location, description, status, daysAgo, update]) => ({
      id: `maintenance-example-${account.id}-${number}`, reference: `M-${number}`, residentId: account.id, suite: account.suite,
      title, category, location, description, status, entryPermission: false, availability: '', createdAt: date(daysAgo), updatedAt: date(Math.max(0, daysAgo - 2)), update
    }));
  }
