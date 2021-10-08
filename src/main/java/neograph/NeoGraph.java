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
 * Copyright 2018-2020 Johann Mortara <johann.mortara@univ-cotedazur.fr>
 * Copyright 2018-2020 Xhevahire Tërnava <t.xheva@gmail.com>
 * Copyright 2018-2020 Philippe Collet <philippe.collet@univ-cotedazur.fr>
 */

package neograph;

import configuration.Configuration;
import neo4j_types.*;
import org.json.JSONObject;
import org.neo4j.driver.*;
import org.neo4j.driver.exceptions.ServiceUnavailableException;
import org.neo4j.driver.types.MapAccessor;
import org.neo4j.driver.types.Node;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

import static org.neo4j.driver.Values.parameters;

public class NeoGraph {

    private Driver driver;

    public NeoGraph(String uri, String user, String password) {
        driver = GraphDatabase.driver(uri, AuthTokens.basic(user, password));
    }

    public NeoGraph(Driver driver) {
        this.driver = driver;
    }

    public static String getClauseForNodesMatchingLabels(String nodeName, NodeType... types) {
        return Arrays.stream(types).map(nodeType -> nodeName + ":" + nodeType.toString()).collect(Collectors.joining(" OR "));
    }

    /**
     * Creates a node of corresponding name and types and returns it.
     *
     * @param name  Node name
     * @param types Node types
     */
    public Node createNode(String name, NodeType type, NodeType... types) {
        List <NodeType> nodeTypes = new ArrayList <>(Arrays.asList(types));
        nodeTypes.add(type);
        return submitRequest(String.format("CREATE (n:%s { name: $name}) RETURN (n)",
                nodeTypes.stream().map(NodeType::getString).collect(Collectors.joining(":"))),
                "name", name)
                .get(0).get(0).asNode();
    }

    public Optional <Node> getNode(String name) {
        List <Record> recordList = submitRequest("MATCH (n {name: $name}) RETURN (n)", "name", name);
        return recordList.size() == 0 ? Optional.empty() : Optional.of(recordList.get(0).get(0).asNode());
    }

    /**
     * Returns the node labeled CLASS and having the name in parameter
     * As we use a custom index :CLASS(name), this method lowers the time spent to execute the query.
     *
     * @param name node name
     * @return the node if it exists, Optional.empty otherwise
     */
    public Optional <Node> getClassNode(String name) {
        List <Record> recordList = submitRequest("MATCH (n:CLASS {name: $name}) RETURN (n)", "name", name);
        return recordList.size() == 0 ? Optional.empty() : Optional.of(recordList.get(0).get(0).asNode());
    }

    /**
     * Returns the node labeled INTERFACE and having the name in parameter
     * As we use a custom index :INTERFACE(name), this method lowers the time spent to execute the query.
     *
     * @param name node name
     * @return the node if it exists, Optional.empty otherwise
     */
    public Optional <Node> getInterfaceNode(String name) {
        List <Record> recordList = submitRequest("MATCH (n:INTERFACE {name: $name}) RETURN (n)", "name", name);
        return recordList.size() == 0 ? Optional.empty() : Optional.of(recordList.get(0).get(0).asNode());
    }

    /**
     * Returns the node corresponding to the superclass of the node whose name is in parameter
     *
     * @param name node name
     * @return the node if it exists, Optional.empty otherwise
     */
    public Optional <Node> getSuperclassNode(String name) {
        List <Record> recordList = submitRequest("MATCH (s:CLASS)-[:EXTENDS]->(n {name: $name}) RETURN (s)", "name", name);
        return recordList.size() == 0 ? Optional.empty() : Optional.of(recordList.get(0).get(0).asNode());
    }

    /**
     * Returns the list of nodes corresponding to the interfaces implemented by the node whose name is in parameter
     *
     * @param name node name
     * @return the node if it exists, Optional.empty otherwise
     */
    public List <Node> getImplementedInterfacesNodes(String name) {
        List <Record> recordList = submitRequest("MATCH (s:INTERFACE)-[:IMPLEMENTS]->(n {name: $name}) RETURN (s)", "name", name);
        return recordList.size() == 0 ? Collections.emptyList() : recordList.stream().map(record -> record.get(0).asNode()).collect(Collectors.toList());
    }

    public Optional <Node> getNodeWithNameInPackage(String name, String packageName) {
        List <Record> recordList = submitRequest("MATCH (n) WHERE (n:CLASS OR n:INTERFACE) AND n.name STARTS WITH $package AND n.name ENDS WITH $inheritedClassName RETURN (n)", "package", packageName + ".", "inheritedClassName", "." + name);
        return recordList.size() == 0 ? Optional.empty() : Optional.of(recordList.get(0).get(0).asNode());
    }

    /**
     * Returns the node if it exists, creates it and returns it otherwise.
     * As we use qualified names, each name is unique. Therefore, we can match only on node name.
     * If the node does not exist, it is created with the specified types as labels.
     *
     * @param name             Node name
     * @param type             Node type
     * @param createAttributes Node attributes added when creating the node
     * @param matchAttributes  Node attributes added when matching an existing node
     */
    public Node getOrCreateNode(String name, EntityType type, EntityAttribute[] createAttributes, EntityAttribute[] matchAttributes) {
        String onCreateAttributes = createAttributes.length == 0 ?
                "" :
                "ON CREATE SET n:" + Arrays.stream(createAttributes)
                        .map(NodeType::getString)
                        .collect(Collectors.joining(":"));
        String onMatchAttributes = matchAttributes.length == 0 ?
                "" :
                "ON MATCH SET n:" + Arrays.stream(matchAttributes)
                        .map(NodeType::getString)
                        .collect(Collectors.joining(":"));
        return submitRequest(String.format("MERGE (n:%s {name: $name}) %s %s RETURN (n)",
                type.toString(),
                onCreateAttributes,
                onMatchAttributes), "name", name)
                .get(0).get(0).asNode();
    }

    public Node getOrCreateNode(String name, EntityType type) {
        return getOrCreateNode(name, type, new EntityAttribute[]{}, new EntityAttribute[]{});
    }

    public Node getOrCreateNode(String name, EntityType type, EntityAttribute[] attributes) {
        return getOrCreateNode(name, type, attributes, attributes);
    }

    /**
     * Creates the relationship node1 -> node2 of the given type.
     *
     * @param node1 source node
     * @param node2 target node
     */
    public void linkTwoNodes(Node node1, Node node2, RelationType type) {
        submitRequest(String.format("MATCH(a)\n" +
                "WHERE ID(a)=$aId\n" +
                "WITH a\n" +
                "MATCH (b)\n" +
                "WITH a,b\n" +
                "WHERE ID(b)=$bId\n" +
                "CREATE (a)-[r:%s]->(b)", type), "aId", node1.id(), "bId", node2.id());
    }

    public void setNodeAttribute(Node node, String attributeName, Object value) {
        submitRequest(String.format("MATCH (n) WHERE ID(n) = $idNode SET n.%s = $value", attributeName),
                "idNode", node.id(), "value", value);
    }

    public void detectHotspots() {
        detectSingularHotspotsInSubtyping(Configuration.getSingularityThreshold());
        detectSingularHotspotsInOverloading(Configuration.getSingularityThreshold());
        detectHotspotsInAggregation(Configuration.getAggregationThreshold());
        setHotspotLabels();
    }

    public void detectHotspotsInAggregation(int threshold) {
        submitRequest("MATCH (vp:VP) " +
                "CALL apoc.path.subgraphAll(vp, {relationshipFilter: \"INSTANTIATE\", minLevel: 0}) " +
                "YIELD nodes " +
                "WITH collect(nodes)[0] AS nodesList, count(nodes) as cnt " +
                "FOREACH (n IN CASE WHEN cnt >= $threshold THEN nodesList ELSE [] END | SET n.aggregation = TRUE)", "threshold", threshold);
        submitRequest("MATCH (vp)-[:EXTENDS]->(v:VARIANT) " +
                "WHERE vp.aggregation = TRUE " +
                "SET v.aggregation = TRUE");
    }

    public void detectSingularHotspotsInSubtyping(int threshold) {
        detectHotspotsInSubtyping("hotspot", threshold);
    }

    public void detectSingularHotspotsInOverloading(int threshold) {
        detectHotspotsInOverloading("hotspot", threshold);
    }

    void detectHotspotsInSubtyping(String property, int threshold) {
        submitRequest(String.format("MATCH (vp:VP)-->(v:VARIANT) " +
                "WITH count(v) as cnt, [vp] + collect(v) AS collected " +
                "WHERE cnt >= $threshold " +
                "FOREACH (v1 IN collected | SET v1.%s = TRUE)", property), "threshold", threshold);
    }

    void detectHotspotsInOverloading(String property, int threshold) {
        submitRequest(String.format("MATCH (n) " +
                "WHERE n.methodVariants + n.constructorVariants >= $threshold " +
                "SET n.%s = TRUE", property), "threshold", threshold);
    }

    public void setHotspotLabels() {
        submitRequest(String.format("MATCH (n) " +
                "WHERE n.hotspot = TRUE OR n.aggregation = TRUE " +
                "SET n:%s", EntityAttribute.HOTSPOT));
    }

    public Object getPropertyValue(Node node, String property) {
        return submitRequest(String.format("MATCH(a)\n" +
                "WHERE ID(a)=$aId\n" +
                "RETURN a.%s", property), "aId", node.id())
                .get(0).get(0).asObject();
    }

    public void detectVPsAndVariants() {
        setMethodVPs();
        setMethodVariants();
        setConstructorVPs();
        setConstructorVariants();
        setNbVariantsProperty();
        setVPLabels();
        setMethodLevelVPLabels();
        setVariantsLabels();
        setPublicMethods();
        setPublicConstructors();
        setNbCompositions();
        setAllMethods();
        detectStrategiesWithComposition();
        detectDensity();
    }

    /**
     * Sets the number of methods with different names defined more than once in the class.
     * <p>
     * Example of a class containing the following methods:
     * - public void add(Point2D pt)
     * - public void add(Rectangle2D r)
     * - public void add(double newx, double newy)
     * - public PathIterator getPathIterator(AffineTransform at)
     * - public PathIterator getPathIterator(AffineTransform at, double flatness)
     * <p>
     * Two methods are overloaded, therefore the value returned will be 2.
     * This is independent of the numbers of overloads for each method.
     * If no method is overloaded, the property is set to 0.
     */
    public void setMethodVPs() {
        submitRequest("MATCH (c:CLASS)-->(a:METHOD) MATCH (c:CLASS)-->(b:METHOD)\n" +
                "WHERE a.name = b.name AND ID(a) <> ID(b)\n" +
                "WITH count(DISTINCT a.name) AS cnt, c\n" +
                "SET c.methodVPs = cnt");
        submitRequest("MATCH (c:CLASS)\n" +
                "WHERE NOT EXISTS(c.methodVPs)\n" +
                "SET c.methodVPs = 0");
    }

    /**
     * Sets the number of public methods in a public class
     */
    public void setPublicMethods() {
        submitRequest("MATCH (c:CLASS:PUBLIC)-->(a:METHOD:PUBLIC)\n" +
                "WITH count( a.name ) AS cnt, c\n" +
                "SET c.publicMethods = cnt");
        submitRequest("MATCH (c:CLASS)\n" +
                "WHERE NOT EXISTS(c.publicMethods)\n" +
                "SET c.publicMethods = 0");
    }

    /**
     * Sets the number of all methods in a class
     */
    public void setAllMethods() {
        submitRequest("MATCH (c:CLASS)-->(a:METHOD)\n" +
                "WITH count( a.name ) AS cnt, c\n" +
                "SET c.allMethods = cnt");
        submitRequest("MATCH (c:CLASS)\n" +
                "WHERE NOT EXISTS(c.allMethods)\n" +
                "SET c.allMethods = 0");
    }

    /**
     * Sets the number of method variants induced by method VPs.
     * <p>
     * Example of a class containing the following methods:
     * - public void add(Point2D pt)
     * - public void add(Rectangle2D r)
     * - public void add(double newx, double newy)
     * - public PathIterator getPathIterator(AffineTransform at)
     * - public PathIterator getPathIterator(AffineTransform at, double flatness)
     * <p>
     * Two methods are overloaded with respectively 3 and 2 overloads, therefore the value returned will be 5.
     * If no method is overloaded, the property is set to 0.
     */
    public void setMethodVariants() {
        submitRequest("MATCH (c:CLASS)-->(a:METHOD) MATCH (c:CLASS)-->(b:METHOD)\n" +
                "WHERE a.name = b.name AND ID(a) <> ID(b)\n" +
                "WITH count(DISTINCT a) AS cnt, c\n" +
                "SET c.methodVariants = cnt");
        submitRequest("MATCH (c:CLASS)\n" +
                "WHERE NOT EXISTS(c.methodVariants)\n" +
                "SET c.methodVariants = 0");
    }

    /**
     * Sets the number of overloaded constructors in the class.
     * If there is more than a constructor, this means that the constructor is overloaded, hence the value is 1.
     * If there is no overload (i.e. there is 0 or 1 constructor), the property is set to 0.
     */
    public void setConstructorVPs() {
        submitRequest("MATCH (c:CLASS)-->(a:CONSTRUCTOR)\n" +
                "WITH count(a.name) AS cnt, c\n" +
                "SET c.constructorVPs = CASE WHEN cnt > 1 THEN 1 ELSE 0 END");
        submitRequest("MATCH (c:CLASS)\n" +
                "WHERE NOT EXISTS(c.constructorVPs)\n" +
                "SET c.constructorVPs = 0");
    }

    public void setPublicConstructors() {
        submitRequest("MATCH (c)-->(a) \n" +
                "WHERE c:PUBLIC AND c:CLASS AND  a:CONSTRUCTOR AND a:PUBLIC\n" +
                "WITH count( a.name ) AS cnt, c\n" +
                "SET c.publicConstructors = cnt");
        submitRequest("MATCH (c:CLASS)\n" +
                "WHERE NOT EXISTS(c.publicConstructors)\n" +
                "SET c.publicConstructors = 0");
    }

    /**
     * Sets the number of overloads of the constructor in the class.
     * If there is no overload (i.e. there is 0 or 1 constructor), the property is set to 0.
     */
    public void setConstructorVariants() {
        submitRequest("MATCH (c:CLASS)-->(a:CONSTRUCTOR)\n" +
                "WITH count(a.name) AS cnt, c\n" +
                "SET c.constructorVariants = CASE WHEN cnt > 1 THEN cnt ELSE 0 END");
        submitRequest("MATCH (c:CLASS)\n" +
                "WHERE NOT EXISTS(c.constructorVariants)\n" +
                "SET c.constructorVariants = 0");
    }

    /**
     * Creates for all class and interfaces nodes a property classVariants expressing the number of subclasses it contains.
     */
    public void setNbVariantsProperty() {
        submitRequest("MATCH (c)-[:EXTENDS|IMPLEMENTS]->(sc:CLASS) WITH count(sc) AS nbVar, c SET c.classVariants = nbVar");
        submitRequest("MATCH (c) WHERE ((c:CLASS OR c:INTERFACE) AND NOT EXISTS (c.classVariants)) SET c.classVariants = 0");
    }

    public void setNbCompositions() {
        submitRequest("MATCH (c)-[:INSTANTIATE]->(a) WITH count(a) AS nbComp, c SET c.nbCompositions = nbComp");
    }

    /**
     * Adds a VP label to the node if it is a VP.
     * A node is a VP if it:
     * - is an abstract class
     * - is an interface
     * - has class or method level variants (subclasses / implementations or methods / constructors overloads)
     * - has a design pattern.
     */
    public void setVPLabels() {
        submitRequest(String.format("MATCH (c) WHERE (NOT c:OUT_OF_SCOPE) AND (c:INTERFACE OR (c:CLASS AND c:ABSTRACT) OR (%s) OR (EXISTS(c.classVariants) AND c.classVariants > 0)) SET c:%s",
                getClauseForHavingDesignPattern("c"),
                EntityAttribute.VP));
    }

    public void setMethodLevelVPLabels() {
        submitRequest(String.format("MATCH (c) WHERE (NOT c:OUT_OF_SCOPE) AND (c.methodVPs > 0 OR c.constructorVPs > 0) SET c:%s",
                EntityAttribute.METHOD_LEVEL_VP));
    }

    public void setVariantsLabels() {
        submitRequest(String.format("MATCH (sc:VP)-[:EXTENDS|IMPLEMENTS]->(c) WHERE c:CLASS OR c:INTERFACE SET c:%s",
                EntityAttribute.VARIANT));
    }

    public void addLabelToNode(Node node, String label) {
        submitRequest(String.format("MATCH (n) WHERE ID(n) = $id SET n:%s RETURN (n)", label), "id", node.id());
    }

    private String getClauseForHavingDesignPattern(String n) {
        return getClauseForNodesMatchingLabels(n, DesignPatternType.values());
    }

    public void writeVPGraphFile(String filePath) {
        writeToFile(filePath, generateVPJsonGraph());
    }

    public void writeStatisticsFile(String filePath) {
        writeToFile(filePath, generateStatisticsJson());
    }

    public void writeToFile(String filePath, String content) {
        Path path = Paths.get(filePath);
        try {
            if (path.toFile().getParentFile().exists() || (path.toFile().getParentFile().mkdirs() && path.toFile().createNewFile())) {
                try (BufferedWriter bw = Files.newBufferedWriter(path)) {
                    bw.write(content);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    public int getNbPublicClass() {
        return submitRequest("MATCH (c:PUBLIC) RETURN (COUNT(DISTINCT c))")
                .get(0).get(0).asInt();
    }

    /**
     * Get number of subclasses of a class or implementations of an interface
     *
     * @param node Node corresponding to the class
     * @return Number of subclasses or implementations
     */
    public int getNbVariants(Node node) {
        return submitRequest("MATCH (c)-[:EXTENDS|IMPLEMENTS]->(c2:CLASS) " +
                "WHERE ID(c) = $id " +
                "RETURN count(c2)", "id", node.id())
                .get(0).get(0).asInt();
    }

    /**
     * Get total number of variants.
     * This corresponds to the number of variants at class and method level.
     *
     * @return Number of variants
     */
    public int getTotalNbVariants() {
        return getNbClassLevelVariants() + getNbMethodLevelVariants();
    }


    /**
     * Get number of variants at class level.
     * This corresponds to the number of concrete classes without a subclass and extending a class or implementing an interface defined in the project.
     *
     * @return Number of class level variants
     */
    public int getNbClassLevelVariants() {
        return submitRequest("MATCH (c:VARIANT) WHERE NOT c:VP RETURN (COUNT(DISTINCT c))")
                .get(0).get(0).asInt();
    }

    /**
     * Get number of variants at class level.
     * This corresponds to the number of concrete classes without a subclass and extending a class or implementing an interface.
     *
     * @return Number of class level variants
     */
    public int getNbMethodLevelVariants() {
        return getNbMethodVariants() + getNbConstructorVariants();
    }

    /**
     * Get number of variants caused by method overloading.
     * This corresponds to the total number of method variants.
     *
     * @return Number of overloaded methods
     */
    public int getNbMethodVariants() {
        return submitRequest("MATCH (c:CLASS) RETURN (SUM(c.methodVariants))")
                .get(0).get(0).asInt();
    }

    /**
     * Get number of variants caused by constructor overloading.
     * This corresponds to the total number of constructor overloads.
     *
     * @return Number of constructor overloads
     */
    public int getNbConstructorVariants() {
        return submitRequest("MATCH (c:CLASS) RETURN (SUM(c.constructorVariants))")
                .get(0).get(0).asInt();
    }

    /**
     * Get total number of overloaded constructors.
     *
     * @return Number of overloaded constructors
     */
    public int getNbConstructorVPs() {
        return submitRequest("MATCH (c:CLASS) RETURN (SUM(c.constructorVPs))")
                .get(0).get(0).asInt();
    }

    /**
     * Get total number of public constructors.
     *
     * @return Number of public constructors
     */
    public int getNbPublicConstructors() {
        return submitRequest("MATCH (c:CLASS) RETURN (SUM(c.publicConstructors))")
                .get(0).get(0).asInt();
    }

    /**
     * Get total number of overloaded methods.
     *
     * @return Number of overloaded methods
     */
    public int getNbMethodVPs() {
        return submitRequest("MATCH (c:CLASS) RETURN (SUM(c.methodVPs))")
                .get(0).get(0).asInt();
    }

    /**
     * Get total number of public methods.
     *
     * @return Number of public methods
     */
    public int getNbPublicMethods() {
        return submitRequest("MATCH (c:CLASS) RETURN (SUM(c.publicMethods))")
                .get(0).get(0).asInt();
    }

    /**
     * Get total number of all methods.
     *
     * @return Number of all methods
     */
    public int getNbAllMethods() {
        return submitRequest("MATCH (c:CLASS) RETURN (SUM(c.allMethods))")
                .get(0).get(0).asInt();
    }


    /**
     * Get total number of VPs.
     * This corresponds to the number of VPs at class and method level.
     *
     * @return Number of VPs
     */
    public int getTotalNbVPs() {
        return getNbClassLevelVPs() + getNbMethodLevelVPs();
    }


    /**
     * Get total number of method level VPs.
     * These are :
     * - overloaded methods
     * - overloaded constructors
     *
     * @return Number of method level VPs
     */
    public int getNbMethodLevelVPs() {
        return getNbMethodVPs() + getNbConstructorVPs();
    }

    /**
     * Get total number of class level VPs.
     * These are :
     * - interfaces
     * - abstract classes
     * - extended classes
     *
     * @return Number of class level VPs
     */
    public int getNbClassLevelVPs() {
        return submitRequest("MATCH (c:VP) RETURN COUNT (DISTINCT c)")
                .get(0).get(0).asInt();
    }

    public int getNbAttributeComposeClass() {
        return submitRequest("MATCH (c:CLASS) RETURN (SUM(c.nbCompositions))")
                .get(0).get(0).asInt();
    }

    public void detectDensity() {
        submitRequest("MATCH (v1:VARIANT)-[:INSTANTIATE]->(v2:VARIANT) " +
                "SET v1:DENSE SET v2:DENSE");
    }

    public void detectStrategiesWithComposition() {
        submitRequest(String.format("MATCH (c)-[:INSTANTIATE]->(c1) " +
                "WHERE (c:CLASS OR c:INTERFACE) AND (EXISTS(c1.classVariants) AND c1.classVariants > 1) " +
                "SET c1:%s", DesignPatternType.COMPOSITION_STRATEGY));
    }

    /**
     * Checks whether two nodes have a direct relationship.
     *
     * @param parentNode source node of the relationship
     * @param childNode  destination node of the relationship
     * @return true if a relationship exists, false otherwise
     */
    public boolean relatedTo(Node parentNode, Node childNode) {
        return submitRequest("MATCH(source) WHERE ID(source) = $idSource MATCH(dest) " +
                        "WHERE ID(dest) = $idDest RETURN EXISTS((source)-[]->(dest))",
                "idSource", parentNode.id(), "idDest", childNode.id())
                .get(0).get(0).asBoolean();
    }

    private String generateVPJsonGraph() {
        return String.format("{\"nodes\":[%s],\"links\":[%s],\"allnodes\":[%s],\"linkscompose\":[%s],\"alllinks\":[%s]}", getNodesAsJson(), getLinksAsJson(), getAllClassesOrInterfaceNodes(), getCompositionLinksAsJson(), getAllLinksAsJson());
    }

    private String getNodesAsJson() {
        String request =
                "MATCH (c) WHERE c:VP OR c:VARIANT OR c:METHOD_LEVEL_VP " +
                        "CALL symfinder.count(ID(c), \"METHOD\") YIELD result as methods " +
                        "CALL symfinder.count(ID(c), \"CONSTRUCTOR\") YIELD result as constructors " +
                        "CALL symfinder.count(ID(c), \"CLASS\") YIELD result as attributes " +
                        "RETURN collect(c {types:labels(c), .name, .methodVPs, .constructorVPs, .methodVariants, .constructorVariants, .publicMethods, .publicConstructors, .allMethods, methods, constructors, attributes, .nbCompositions})";
        return submitRequest(request)
                .get(0)
                .get(0)
                .asList(MapAccessor::asMap)
                .stream()
                .map(o -> new JSONObject(o).toString())
                .collect(Collectors.joining(","));
    }

    private String getAllClassesOrInterfaceNodes() {
        String request =
                "MATCH (c) WHERE (c:CLASS OR c:INTERFACE) AND NOT c:OUT_OF_SCOPE " +
                        "CALL symfinder.count(ID(c), \"METHOD\") YIELD result as methods " +
                        "CALL symfinder.count(ID(c), \"CONSTRUCTOR\") YIELD result as constructors " +
                        "CALL symfinder.count(ID(c), \"CLASS\") YIELD result as attributes " +
                        "CALL symfinder.count(ID(c), \"INTERFACE\") YIELD result as interfaceAttributes " +
                        "RETURN collect(c {types:labels(c), .name, .methodVPs, .constructorVPs, .methodVariants, .constructorVariants, .publicMethods, .publicConstructors, .allMethods, methods, constructors, attributes, .nbCompositions, interfaceAttributes})";
        return submitRequest(request)
                .get(0)
                .get(0)
                .asList(MapAccessor::asMap)
                .stream()
                .map(o -> new JSONObject(o).toString())
                .collect(Collectors.joining(","));
    }

    private String getLinksAsJson() {
        String request = "MATCH path = (c1:VP)-[r:EXTENDS|IMPLEMENTS]->(c2) WHERE NONE(n IN nodes(path) WHERE n:OUT_OF_SCOPE) RETURN collect({source:c1.name, target:c2.name, type:TYPE(r)})";
        return submitRequest(request)
                .get(0)
                .get(0)
                .asList(MapAccessor::asMap)
                .stream()
                .map(o -> new JSONObject(o).toString())
                .collect(Collectors.joining(","));
    }

    private String getCompositionLinksAsJson() {
        String request = "MATCH path = (c1:CLASS)-[r:INSTANTIATE]->(c2) WHERE NONE(n IN nodes(path) WHERE n:OUT_OF_SCOPE) RETURN collect({source:c1.name, target:c2.name, type:TYPE(r)})";
        return submitRequest(request)
                .get(0)
                .get(0)
                .asList(MapAccessor::asMap)
                .stream()
                .map(o -> new JSONObject(o).toString())
                .collect(Collectors.joining(","));
    }

    private String getAllLinksAsJson() {
        String request = "MATCH path = (c1)-[r:INSTANTIATE|EXTENDS|IMPLEMENTS]->(c2) WHERE NONE(n IN nodes(path) WHERE n:OUT_OF_SCOPE) RETURN collect({source:c1.name, target:c2.name, type:TYPE(r)})";
        return submitRequest(request)
                .get(0)
                .get(0)
                .asList(MapAccessor::asMap)
                .stream()
                .map(o -> new JSONObject(o).toString())
                .collect(Collectors.joining(","));
    }

    public String generateStatisticsJson() {
        return new JSONObject()
                .put("VPs", getTotalNbVPs())
                .put("methodsVPs", getNbMethodVPs())
                .put("constructorsVPs", getNbConstructorVPs())
                .put("methodLevelVPs", getNbMethodLevelVPs())
                .put("classLevelVPs", getNbClassLevelVPs())
                .put("variants", getTotalNbVariants())
                .put("methodsVariants", getNbMethodVariants())
                .put("constructorsVariants", getNbConstructorVariants())
                .put("methodLevelVariants", getNbMethodLevelVariants())
                .put("classLevelVariants", getNbClassLevelVariants())
                .put("publicMethods", getNbPublicMethods())
                .put("allMethods", getNbAllMethods())
                .put("publicsConstructors", getNbPublicConstructors())
                .put("nbCompositionClasses", getNbAttributeComposeClass()).toString();
    }

    public int getNbNodes() {
        return submitRequest("MATCH(n) RETURN count(*)").get(0).get(0).asInt();
    }

    public int getNbRelationships() {
        return submitRequest("MATCH (n)-[r]->() RETURN COUNT(r)").get(0).get(0).asInt();
    }

    public int getNbInheritanceRelationships() {
        return submitRequest("MATCH (n)-[r:EXTENDS|IMPLEMENTS]->() RETURN COUNT(r)").get(0).get(0).asInt();
    }

    public int getNbCompositionRelationship() {
        return submitRequest("MATCH (n) - [r:INSTANTIATE]-> () RETURN COUNT(r)").get(0).get(0).asInt();
    }

    public void createClassesIndex() {
        submitRequest("CREATE INDEX ON :CLASS(name)");
    }

    public void createInterfacesIndex() {
        submitRequest("CREATE INDEX ON :INTERFACE(name)");
    }

    /**
     * Deletes all nodes and relationships in the graph.
     */
    public void deleteGraph() {
        submitRequest("MATCH (n) DETACH DELETE (n)");
    }

    private List <Record> submitRequest(String request, Object... parameters) {
        int count = 0;
        int maxTries = 20;
        while (true) {
            try (Session session = driver.session()) {
                try (Transaction tx = session.beginTransaction()) {
                    List <Record> result = tx.run(request, parameters(parameters)).list();
                    tx.commit();
                    return result;
                }
            } catch (ServiceUnavailableException e) { // The database is not ready, retry to connect
                System.out.println("Waiting for Neo4j database to be ready...");
                if (++ count == maxTries) {
                    throw e;
                }
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException e1) {
                    e1.printStackTrace();
                }
            }
        }
    }

    public void closeDriver() {
        driver.close();
    }

}
