# Rules Engine

## What it is
A deterministic evaluator that produces warnings/errors for a build based on:
- engine_family attributes (rotor_count, port_type, aspiration, target_hp)
- selected parts + their typed attributes
- category context (what subsystem the part belongs to)

## Rule Storage
CompatRule
- rule_id PK
- scope ENUM('build','category','selection')
- severity ENUM('info','warn','error','block')
- condition_expr TEXT (DSL)
- message_template TEXT
- applies_to_category_id NULLABLE
- applies_to_engine_family_id NULLABLE
- priority INT
- enabled BOOL

## Expression DSL (simple + safe)
Allowed operators:
- AND, OR, NOT
- =, !=, <, <=, >, >=
- IN (...)
- EXISTS(selection WHERE ...)
Allowed value sources:
- build.<field>
- engine.<field>
- part.<attr_slug> (current selection)
- has_category('<slug>')
- selected_count('<category_slug>')
- selected_attr('<category_slug>','<attr_slug>')

Examples:
1) error if turbo selected but no upgraded fuel pump:
scope=build severity=error
condition_expr:
  build.aspiration = 'turbo' AND NOT EXISTS(selection WHERE has_category('fuel_pump_upgrade'))
message:
  "Turbo build selected but no upgraded fuel pump. Add a DW300/450-class pump or equivalent."

2) warn if high rpm with weak apex seals:
scope=build severity=warn
condition_expr:
  engine.target_rpm >= 8500 AND selected_attr('apex_seals','material') IN ('cast_iron_oem')
message:
  "High RPM target with OEM-style cast apex seals. Consider upgraded seals to reduce risk."

## Outputs
warnings[]:
- rule_id
- severity
- message
- related_category_id
- related_part_id
- suggested_actions[] (optional)

## Determinism Rules
- Evaluate in priority ASC, then rule_id ASC
- No random or time-based logic
- Same inputs => same outputs
