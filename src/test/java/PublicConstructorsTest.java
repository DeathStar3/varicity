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
import neo4j_types.EntityVisibility;
import neo4j_types.RelationType;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.types.Node;

import static org.junit.Assert.assertEquals;

public class PublicConstructorsTest extends Neo4jTest {

    @Test
    public void OnePrivateConstructor() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node constructor = graph.createNode("Shape", EntityType.CONSTRUCTOR, EntityVisibility.PRIVATE);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, constructor, relationType);
            graph.setPublicConstructors();
            assertEquals(0, graph.getNbPublicConstructors());
        });
    }

    @Test
    public void OnePublicConstructorInANotPublicClass() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS);
            Node constructor = graph.createNode("Shape", EntityType.CONSTRUCTOR, EntityVisibility.PUBLIC);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, constructor, relationType);
            graph.setPublicConstructors();
            assertEquals(0, graph.getNbPublicConstructors());
        });
    }

    @Test
    public void OnePublicMethodInAPublicClass() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node constructor = graph.createNode("Shape", EntityType.CONSTRUCTOR, EntityVisibility.PUBLIC);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, constructor, relationType);
            graph.setPublicConstructors();
            assertEquals(1, graph.getNbPublicConstructors());
        });
    }

    @Test
    public void OneMethodOneConstructor() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node method = graph.createNode("display", EntityType.METHOD, EntityVisibility.PUBLIC);
            Node constructor = graph.createNode("Shape", EntityType.CONSTRUCTOR, EntityVisibility.PUBLIC);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, method, relationType);
            graph.linkTwoNodes(shapeClass, constructor, relationType);
            graph.setPublicConstructors();
            assertEquals(1, graph.getNbPublicConstructors());
        });
    }

    @Test
    public void TwoConstructors() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node constructor = graph.createNode("Shape", EntityType.CONSTRUCTOR, EntityVisibility.PUBLIC);
            Node constructor2 = graph.createNode("Shape", EntityType.CONSTRUCTOR, EntityVisibility.PUBLIC);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, constructor, relationType);
            graph.linkTwoNodes(shapeClass, constructor2, relationType);
            graph.setPublicConstructors();
            assertEquals(2, graph.getNbPublicConstructors());
        });
    }

    @Test
    public void TwoConstructorsButOneIsPrivate() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node constructor = graph.createNode("Shape", EntityType.CONSTRUCTOR, EntityVisibility.PUBLIC);
            Node constructor2 = graph.createNode("Shape", EntityType.CONSTRUCTOR, EntityVisibility.PRIVATE);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, constructor, relationType);
            graph.linkTwoNodes(shapeClass, constructor2, relationType);
            graph.setPublicConstructors();
            assertEquals(1, graph.getNbPublicConstructors());
        });
    }

    @Test
    public void TwoClassesWithConstructors() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node shapeConstructor = graph.createNode("Shape", EntityType.CONSTRUCTOR, EntityVisibility.PUBLIC);
            Node rectangleConstructor = graph.createNode("Rectangle", EntityType.CONSTRUCTOR, EntityVisibility.PUBLIC);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, shapeConstructor, relationType);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor, relationType);
            graph.setPublicConstructors();
            assertEquals(2, graph.getNbPublicConstructors());
        });
    }

    @Test
    public void TwoClassesWithPublicAndPrivateConstructors() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node shapeConstructor = graph.createNode("Shape", EntityType.CONSTRUCTOR, EntityVisibility.PUBLIC);
            Node rectangleConstructor = graph.createNode("Rectangle", EntityType.CONSTRUCTOR, EntityVisibility.PRIVATE);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, shapeConstructor, relationType);
            graph.linkTwoNodes(rectangleClass, rectangleConstructor, relationType);
            graph.setPublicConstructors();
            assertEquals(1, graph.getNbPublicConstructors());
        });
    }

}