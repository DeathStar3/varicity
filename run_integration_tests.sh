#!/bin/bash
#
# This file is part of symfinder.
#
# symfinder is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# symfinder is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with symfinder. If not, see <http://www.gnu.org/licenses/>.
#
# Copyright 2018-2021 Johann Mortara <johann.mortara@univ-cotedazur.fr>
# Copyright 2018-2021 Xhevahire Tërnava <t.xheva@gmail.com>
# Copyright 2018-2021 Philippe Collet <philippe.collet@univ-cotedazur.fr>
#

set -e

create_directory(){
    if [[ ! -d "$1" ]]; then
        echo "Creating $1 directory"
        mkdir "$1"
    else
        echo "$1 directory already exists"
    fi
}

sed -i -e 's/experiments.yaml/test-experiments.yaml/g' symfinder.yaml
create_directory resources
cp -r test_projects/* resources/

docker run --rm --name test_projects_builder -v "$(pwd)/resources":/usr/src/mymaven -w /usr/src/mymaven maven:3-jdk-8 mvn clean compile clean

./build.sh -DskipTests
./run.sh --local

function run_tests() {
  export CONTEXT_FILE="$1"
  export TESTS_DIR="$2"
  docker-compose -f integration-tests-compose.yaml up --abort-on-container-exit --exit-code-from integration
  RETURN_CODE=$?
  docker-compose -f integration-tests-compose.yaml down
}

docker-compose -f integration-tests-compose.yaml build

echo "Running integration tests on standard visualization"
run_tests "pages/context.html" "tests"

if [ $RETURN_CODE != 0 ]; then
    exit $RETURN_CODE
fi

echo "Running integration tests on composition visualization"
run_tests "pages/context_composition.html" "composition_tests"

sed -i -e 's/test-experiments.yaml/experiments.yaml/g' symfinder.yaml

exit $RETURN_CODE