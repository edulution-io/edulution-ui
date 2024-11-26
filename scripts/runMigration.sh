echo "first  argument: $1"
echo "second argument: $2"

# Run Madge on the filtered files
cd "../libs/src/$1/migration"
migrate $2
exit 0
