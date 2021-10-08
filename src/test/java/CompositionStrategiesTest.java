import neo4j_types.DesignPatternType;
import neo4j_types.EntityType;
import neo4j_types.RelationType;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.types.Node;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CompositionStrategiesTest extends Neo4jTest {

    private final String cs = DesignPatternType.COMPOSITION_STRATEGY.toString();

    @Test
    public void twoVariantsSoIsAStrategy() {
        runTest(neoGraph -> {
            Node shape = neoGraph.createNode("Shape", EntityType.CLASS);
            Node rectangle = neoGraph.createNode("Rectangle", EntityType.CLASS);
            Node circle = neoGraph.createNode("Circle", EntityType.CLASS);
            Node main = neoGraph.createNode("Main", EntityType.CLASS);
            neoGraph.linkTwoNodes(shape, rectangle, RelationType.EXTENDS);
            neoGraph.linkTwoNodes(shape, circle, RelationType.EXTENDS);
            neoGraph.linkTwoNodes(main, shape, RelationType.INSTANTIATE);
            neoGraph.setNbVariantsProperty();
            neoGraph.detectStrategiesWithComposition();
            assertTrue(neoGraph.getNode("Shape").get().hasLabel(cs));
            assertFalse(neoGraph.getNode("Rectangle").get().hasLabel(cs));
            assertFalse(neoGraph.getNode("Circle").get().hasLabel(cs));
        });
    }

    @Test
    public void oneVariantSoIsNotAStrategy() {
        runTest(neoGraph -> {
            Node shape = neoGraph.createNode("Shape", EntityType.CLASS);
            Node rectangle = neoGraph.createNode("Rectangle", EntityType.CLASS);
            Node main = neoGraph.createNode("Main", EntityType.CLASS);
            neoGraph.linkTwoNodes(shape, rectangle, RelationType.EXTENDS);
            neoGraph.linkTwoNodes(main, shape, RelationType.INSTANTIATE);
            neoGraph.setNbVariantsProperty();
            neoGraph.detectStrategiesWithComposition();
            assertFalse(neoGraph.getNode("Shape").get().hasLabel(cs));
            assertFalse(neoGraph.getNode("Rectangle").get().hasLabel(cs));
        });
    }

}
