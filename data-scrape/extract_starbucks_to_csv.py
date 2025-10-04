import json
import csv
# https://api.dineoncampus.com/v1/location/6440835cc625af079eb5ddb3/periods?platform=0&date=2025-6-5
# Load the JSON data
with open('../data-scrape/starbucks.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

rows = []
unique_id = 100
DUMMY_PRICE = 4.99

# Traverse categories and items
for category in data['menu']['periods']['categories']:
    for item in category['items']:
        name = item.get('name', '').replace('\n', ' ').replace('\r', ' ').strip()
        desc = item.get('desc', '').replace('\n', ' ').replace('\r', ' ').strip()
        rows.append([
            unique_id,
            name,
            DUMMY_PRICE,
            desc,
            13
        ])
        unique_id += 1

# Write to CSV
with open('starbucks_items.csv', 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['id', 'name', 'price', 'description', 'restaurant_id'])
    writer.writerows(rows)

print(f"Extracted {len(rows)} items to starbucks_items.csv") 