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

import neo4j_types.EntityType;
import neo4j_types.RelationType;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.types.Node;

import static org.junit.Assert.assertEquals;

public class MethodLevelVariantsTest extends Neo4jTest {

    @Test
    public void OneClassNoConstructorVariantNoMethodVariant() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
            Node rectangleConstructor = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node drawMethod = graph.createNode("draw", EntityType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, drawMethod, RelationType.METHOD);
            graph.setMethodVariants();
            graph.setConstructorVariants();
            assertEquals(0, graph.getNbMethodVariants());
            assertEquals(0, graph.getNbConstructorVariants());
            assertEquals(0, graph.getNbMethodLevelVariants());
        });
    }

    @Test
    public void OneClassNoConstructorVariantTwoMethodVariants() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
            Node rectangleConstructor = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node drawMethod1 = graph.createNode("draw", EntityType.METHOD);
            Node drawMethod2 = graph.createNode("draw", EntityType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, drawMethod1, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, drawMethod2, RelationType.METHOD);
            graph.setMethodVariants();
            graph.setConstructorVariants();
            assertEquals(2, graph.getNbMethodVariants());
            assertEquals(0, graph.getNbConstructorVariants());
            assertEquals(2, graph.getNbMethodLevelVariants());
        });
    }

    @Test
    public void OneClassTwoConstructorVariantsNoMethodVariant() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
            Node rectangleConstructor1 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node rectangleConstructor2 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node drawMethod = graph.createNode("draw", EntityType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor1, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor2, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, drawMethod, RelationType.METHOD);
            graph.setMethodVariants();
            graph.setConstructorVariants();
            assertEquals(0, graph.getNbMethodVariants());
            assertEquals(2, graph.getNbConstructorVariants());
            assertEquals(2, graph.getNbMethodLevelVariants());
        });
    }

    @Test
    public void OneClassTwoConstructorVariantsTwoMethodVariants() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
            Node rectangleConstructor1 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node rectangleConstructor2 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node drawMethod1 = graph.createNode("draw", EntityType.METHOD);
            Node drawMethod2 = graph.createNode("draw", EntityType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor1, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor2, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, drawMethod1, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, drawMethod2, RelationType.METHOD);
            graph.setMethodVariants();
            graph.setConstructorVariants();
            assertEquals(2, graph.getNbMethodVariants());
            assertEquals(2, graph.getNbConstructorVariants());
            assertEquals(4, graph.getNbMethodLevelVariants());
        });
    }


    @Test
    public void TwoClasses() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
            Node rectangleConstructor1 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node rectangleConstructor2 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node circleClass = graph.createNode("Circle", EntityType.CLASS);
            Node drawMethod1 = graph.createNode("draw", EntityType.METHOD);
            Node drawMethod2 = graph.createNode("draw", EntityType.METHOD);
            Node drawMethod3 = graph.createNode("draw", EntityType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor1, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor2, RelationType.METHOD);
            graph.linkTwoNodes(circleClass, drawMethod1, RelationType.METHOD);
            graph.linkTwoNodes(circleClass, drawMethod2, RelationType.METHOD);
            graph.linkTwoNodes(circleClass, drawMethod3, RelationType.METHOD);
            graph.setMethodVariants();
            graph.setConstructorVariants();
            assertEquals(3, graph.getNbMethodVariants());
            assertEquals(2, graph.getNbConstructorVariants());
            assertEquals(5, graph.getNbMethodLevelVariants());
        });
    }

}
