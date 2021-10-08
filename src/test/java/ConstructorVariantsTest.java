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

public class ConstructorVariantsTest extends Neo4jTest {

    @Test
    public void OneClassNoConstructorVariant() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
            Node rectangleConstructor = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor, RelationType.METHOD);
            graph.setConstructorVariants();
            assertEquals(0, graph.getNbConstructorVariants());
        });
    }

    @Test
    public void OneClassTwoConstructorVariants() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
            Node rectangleConstructor1 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node rectangleConstructor2 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor1, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor2, RelationType.METHOD);
            graph.setConstructorVariants();
            assertEquals(2, graph.getNbConstructorVariants());
        });
    }

    @Test
    public void OneClassThreeConstructorVariants() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
            Node rectangleConstructor1 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node rectangleConstructor2 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node rectangleConstructor3 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor1, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor2, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor3, RelationType.METHOD);
            graph.setConstructorVariants();
            assertEquals(3, graph.getNbConstructorVariants());
        });
    }

   @Test
    public void TwoClassesNoConstructorVariant() {
       runTest(graph -> {
           Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
           Node rectangleConstructor = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
           Node circleClass = graph.createNode("Circle", EntityType.CLASS);
           Node circleConstructor = graph.createNode("Circle", EntityType.METHOD);
           graph.linkTwoNodes(rectangleClass, rectangleConstructor, RelationType.METHOD);
           graph.linkTwoNodes(circleClass, circleConstructor, RelationType.METHOD);
           graph.setConstructorVariants();
           assertEquals(0, graph.getNbConstructorVariants());
       });
    }

    @Test
    public void TwoClassesTwoConstructorVariantsOnOneClass() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
            Node rectangleConstructor1 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node rectangleConstructor2 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node circleClass = graph.createNode("Circle", EntityType.CLASS);
            Node circleConstructor = graph.createNode("Circle", EntityType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor1, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor2, RelationType.METHOD);
            graph.linkTwoNodes(circleClass, circleConstructor, RelationType.METHOD);
            graph.setConstructorVariants();
            assertEquals(2, graph.getNbConstructorVariants());
        });
    }

    @Test
    public void TwoClassesTwoConstructorVariantsOnBothClasses() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
            Node circleClass = graph.createNode("Circle", EntityType.CLASS);
            Node rectangleConstructor1 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node rectangleConstructor2 = graph.createNode("Rectangle", EntityType.CONSTRUCTOR);
            Node circleConstructor1 = graph.createNode("Circle", EntityType.CONSTRUCTOR);
            Node circleConstructor2 = graph.createNode("Circle", EntityType.CONSTRUCTOR);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor1, RelationType.METHOD);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor2, RelationType.METHOD);
            graph.linkTwoNodes(circleClass, circleConstructor1, RelationType.METHOD);
            graph.linkTwoNodes(circleClass, circleConstructor2, RelationType.METHOD);
            graph.setConstructorVariants();
            assertEquals(4, graph.getNbConstructorVariants());
        });
    }

}
