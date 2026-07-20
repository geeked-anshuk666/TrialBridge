# Entity relationships
`subscriptions.condition_keywords` stores the minimal matching key. `last_seen_trial_ids` is a JSON array; a refresh compares current IDs against it and notifies only on set difference.

