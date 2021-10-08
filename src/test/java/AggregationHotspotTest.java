/*
 * This file is part of symfinder.
 *
 * symfinder is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * symfinder is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with symfinder. If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2018-2021 Johann Mortara <johann.mortara@univ-cotedazur.fr>
 * Copyright 2018-2021 Xhevahire Tërnava <t.xheva@gmail.com>
 * Copyright 2018-2021 Philippe Collet <philippe.collet@univ-cotedazur.fr>
 */

import neo4j_types.EntityAttribute;
import neo4j_types.EntityType;
import neo4j_types.RelationType;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.types.Node;

import static org.junit.Assert.*;

public class AggregationHotspotTest extends Neo4jTest {

    @Test
    public void fiveVPsThresholdFive() {
        runTest(graph -> {
            Node vp1 = graph.createNode("VP1", EntityType.CLASS, EntityAttribute.VP);
            Node vp2 = graph.createNode("VP2", EntityType.CLASS, EntityAttribute.VP);
            Node vp3 = graph.createNode("VP3", EntityType.CLASS, EntityAttribute.VP);
            Node vp4 = graph.createNode("VP4", EntityType.CLASS, EntityAttribute.VP);
            Node vp5 = graph.createNode("VP5", EntityType.CLASS, EntityAttribute.VP);
            graph.linkTwoNodes(vp1, vp2, RelationType.INSTANTIATE);
            graph.linkTwoNodes(vp1, vp3, RelationType.INSTANTIATE);
            graph.linkTwoNodes(vp2, vp4, RelationType.INSTANTIATE);
            graph.linkTwoNodes(vp3, vp5, RelationType.INSTANTIATE);
            graph.detectHotspotsInAggregation(5);
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP1").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP2").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP3").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP4").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP5").get(), "aggregation"));
        });
    }

    @Test
    public void fiveVPsThresholdTwo() {
        runTest(graph -> {
            Node vp1 = graph.createNode("VP1", EntityType.CLASS, EntityAttribute.VP);
            Node vp2 = graph.createNode("VP2", EntityType.CLASS, EntityAttribute.VP);
            Node vp3 = graph.createNode("VP3", EntityType.CLASS, EntityAttribute.VP);
            Node vp4 = graph.createNode("VP4", EntityType.CLASS, EntityAttribute.VP);
            Node v1 = graph.createNode("V1", EntityType.CLASS);
            graph.linkTwoNodes(vp1, vp2, RelationType.INSTANTIATE);
            graph.linkTwoNodes(vp3, vp4, RelationType.INSTANTIATE);
            graph.linkTwoNodes(vp2, v1, RelationType.INSTANTIATE);
            graph.linkTwoNodes(vp4, v1, RelationType.INSTANTIATE);
            graph.detectHotspotsInAggregation(2);
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP1").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP2").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP3").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP4").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("V1").get(), "aggregation"));
        });
    }

    @Test
    public void TwoVPsWithVariantsThresholdTwo() {
        runTest(graph -> {
            Node vp1 = graph.createNode("VP1", EntityType.CLASS, EntityAttribute.VP);
            Node vp1v1 = graph.createNode("VP1V1", EntityType.CLASS, EntityAttribute.VARIANT);
            Node vp1v2 = graph.createNode("VP1V2", EntityType.CLASS, EntityAttribute.VARIANT);
            Node vp2 = graph.createNode("VP2", EntityType.CLASS, EntityAttribute.VP);
            Node vp2v1 = graph.createNode("VP2V1", EntityType.CLASS, EntityAttribute.VARIANT);
            Node vp2v2 = graph.createNode("VP2V2", EntityType.CLASS, EntityAttribute.VARIANT);
            graph.linkTwoNodes(vp1, vp2, RelationType.INSTANTIATE);
            graph.linkTwoNodes(vp1, vp1v1, RelationType.EXTENDS);
            graph.linkTwoNodes(vp1, vp1v2, RelationType.EXTENDS);
            graph.linkTwoNodes(vp2, vp2v1, RelationType.EXTENDS);
            graph.linkTwoNodes(vp2, vp2v2, RelationType.EXTENDS);
            graph.detectHotspotsInAggregation(2);
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP1").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP2").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP1V1").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP1V2").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP2V1").get(), "aggregation"));
            assertTrue((boolean) graph.getPropertyValue(graph.getNode("VP2V2").get(), "aggregation"));
        });
    }

}
