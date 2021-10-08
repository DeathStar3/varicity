import neo4j_types.EntityAttribute;
import neo4j_types.EntityType;
import neo4j_types.RelationType;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.types.Node;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CompositionDensityTest extends Neo4jTest {

    @Test
    public void twoVariantsOnEachSide() {
        runTest(neoGraph -> {
            Node vp1 = neoGraph.createNode("Vp1", EntityType.CLASS);
            Node v1vp1 = neoGraph.createNode("V1Vp1", EntityType.CLASS, EntityAttribute.VARIANT);
            Node v2vp1 = neoGraph.createNode("V2Vp1", EntityType.CLASS, EntityAttribute.VARIANT);
            Node vp2 = neoGraph.createNode("Vp2", EntityType.CLASS);
            Node v1vp2 = neoGraph.createNode("V1Vp2", EntityType.CLASS, EntityAttribute.VARIANT);
            Node v2vp2 = neoGraph.createNode("V2Vp2", EntityType.CLASS, EntityAttribute.VARIANT);
            neoGraph.linkTwoNodes(vp1, v1vp1, RelationType.EXTENDS);
            neoGraph.linkTwoNodes(vp1, v2vp1, RelationType.EXTENDS);
            neoGraph.linkTwoNodes(vp2, v1vp2, RelationType.EXTENDS);
            neoGraph.linkTwoNodes(vp2, v2vp2, RelationType.EXTENDS);
            neoGraph.linkTwoNodes(v1vp1, v1vp2, RelationType.INSTANTIATE);
            neoGraph.linkTwoNodes(v2vp1, v2vp2, RelationType.INSTANTIATE);
            neoGraph.detectDensity();
            assertTrue(neoGraph.getNode("V1Vp1").get().hasLabel("DENSE"));
            assertTrue(neoGraph.getNode("V1Vp2").get().hasLabel("DENSE"));
            assertTrue(neoGraph.getNode("V2Vp1").get().hasLabel("DENSE"));
            assertTrue(neoGraph.getNode("V2Vp2").get().hasLabel("DENSE"));
        });
    }

    @Test
    @Disabled
    public void oneVariantOnEachSide() {
        runTest(neoGraph -> {
            Node vp1 = neoGraph.createNode("Vp1", EntityType.CLASS);
            Node v1vp1 = neoGraph.createNode("V1Vp1", EntityType.CLASS, EntityAttribute.VARIANT);
            Node vp2 = neoGraph.createNode("Vp2", EntityType.CLASS);
            Node v1vp2 = neoGraph.createNode("V1Vp2", EntityType.CLASS, EntityAttribute.VARIANT);
            neoGraph.linkTwoNodes(vp1, v1vp1, RelationType.EXTENDS);
            neoGraph.linkTwoNodes(vp2, v1vp2, RelationType.EXTENDS);
            neoGraph.linkTwoNodes(v1vp1, v1vp2, RelationType.INSTANTIATE);
            neoGraph.detectDensity();
            assertFalse(neoGraph.getNode("V1Vp1").get().hasLabel("DENSE"));
            assertFalse(neoGraph.getNode("V1Vp2").get().hasLabel("DENSE"));
        });
    }

}
