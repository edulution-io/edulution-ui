echo "first  argument [MODULE-NAME]     : $1"
echo "second argument [MIGRATE-OPERATOR]: $2"

cd "../libs/src/$1/migration"
migrate $2
exit 0
