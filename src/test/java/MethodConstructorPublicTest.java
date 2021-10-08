
import neo4j_types.EntityType;
import neo4j_types.EntityVisibility;
import neo4j_types.RelationType;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.types.Node;

import static org.junit.Assert.assertEquals;

public class MethodConstructorPublicTest extends Neo4jTest{

    @Test
    public void OnePublicMethod() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node drawMethod = graph.createNode("draw", EntityType.METHOD, EntityVisibility.PUBLIC);
            graph.linkTwoNodes(rectangleClass, drawMethod, RelationType.METHOD);
            graph.setPublicMethods();

            assertEquals(1,graph.getNbPublicMethods());
        });
    }

    @Test
    public void TwoPublicsAndPrivateMethods() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node drawMethod1 = graph.createNode("draw", EntityType.METHOD, EntityVisibility.PUBLIC);
            graph.linkTwoNodes(rectangleClass, drawMethod1, RelationType.METHOD);
            Node drawMethod2 = graph.createNode("draw", EntityType.METHOD, EntityVisibility.PUBLIC);
            graph.linkTwoNodes(rectangleClass, drawMethod2, RelationType.METHOD);
            Node drawMethod3 = graph.createNode("draw", EntityType.METHOD, EntityVisibility.PRIVATE);
            graph.linkTwoNodes(rectangleClass, drawMethod3, RelationType.METHOD);
            graph.setPublicMethods();

            assertEquals(2,graph.getNbPublicMethods());
        });
    }

    @Test
    public void OnePublicMethodInPrivateClass() {
        runTest(graph -> {
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS, EntityVisibility.PRIVATE);
            Node drawMethod = graph.createNode("draw", EntityType.METHOD, EntityVisibility.PUBLIC);
            graph.linkTwoNodes(rectangleClass, drawMethod, RelationType.METHOD);
            graph.setPublicMethods();

            assertEquals(0,graph.getNbPublicMethods());
        });
    }
}
