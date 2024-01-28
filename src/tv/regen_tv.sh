# set -x

printf "export const tvs = {\n" > ../tv.js

rm -f *.json
rm -f *.csv

# convert the excel file to csv
ssconvert valeur_tables.xlsx -S "%s.csv"

# convert the csv files to json
for csv in *.csv; do 
	echo + $csv
	name=${csv%.csv}
	printf "\"${name}\": " >> ../tv.js
	cat $csv | python -c '
import csv, json, sys
data = [dict(r) for r in csv.DictReader(sys.stdin)]
filtered_data = []
for record in data:
    filtered_record = {key: value for key, value in record.items() if value.strip()}
    filtered_data.append(filtered_record)
print(json.dumps(filtered_data, indent=2))
' | jq . >> ../tv.js
	printf ",\n" >> ../tv.js
done

rm *.csv

ssconvert 18.2_sollicitations_ext.gnumeric -S '%s.csv'
ssconvert 18.5_c1.gnumeric -S '%s.csv'

for csv in *.csv; do
	echo + $csv
	name=${csv%.csv}
	printf "\"${name}\": " >> ../tv.js
	cat $csv | ./gnumeric_to_json.py | jq . >> ../tv.js
	printf ",\n" >> ../tv.js
done
printf "}\n" >> ../tv.js
printf "export default tvs" >> ../tv.js

ssconvert valeur_tables.xlsx -S "%s.csv"
