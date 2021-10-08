package visitors;

import neo4j_types.*;
import neograph.NeoGraph;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.eclipse.jdt.core.dom.ITypeBinding;
import org.eclipse.jdt.core.dom.MethodDeclaration;
import org.eclipse.jdt.core.dom.Modifier;
import org.eclipse.jdt.core.dom.TypeDeclaration;
import org.neo4j.driver.types.Node;

import java.util.ArrayList;
import java.util.List;

/**
 * Parses all classes and the methods they contain, and adds them to the database.
 */
public class ClassesVisitor extends SymfinderVisitor {

    private static final Logger logger = LogManager.getLogger(ClassesVisitor.class);

    public ClassesVisitor(NeoGraph neoGraph) {
        super(neoGraph);
    }

    @Override
    public boolean visit(TypeDeclaration type) {
        if (super.visit(type)) {
            EntityType nodeType;
            EntityVisibility nodeVisibility = Modifier.isPublic(type.getModifiers()) ? EntityVisibility.PUBLIC : EntityVisibility.PRIVATE;
            NodeType [] nodeTypeList;
            // If the class is abstract
            if (Modifier.isAbstract(type.getModifiers())) {
                nodeType = EntityType.CLASS;
                nodeTypeList = new NodeType[]{EntityAttribute.ABSTRACT, nodeVisibility};
                // If the type is an interface
            } else if (type.isInterface()) {
                nodeType = EntityType.INTERFACE;
                nodeTypeList = new NodeType[]{nodeVisibility};
                // The type is a class
            } else {
                nodeType = EntityType.CLASS;
                nodeTypeList = new NodeType[]{nodeVisibility};
            }
            neoGraph.createNode(type.resolveBinding().getQualifiedName(), nodeType, nodeTypeList);
            return true;
        }
        return false;
    }

    @Override
    public boolean visit(MethodDeclaration method) {
        // Ignoring methods in anonymous classes
        ITypeBinding declaringClass;
        if (! (method.resolveBinding() == null)) {
            declaringClass = method.resolveBinding().getDeclaringClass();
            String methodName = method.getName().getIdentifier();
            String parentClassName = declaringClass.getQualifiedName();
            logger.printf(Level.DEBUG, "Method: %s, parent: %s", methodName, parentClassName);
            //Node methodNode = Modifier.isAbstract(method.getModifiers()) ? neoGraph.createNode(methodName, methodType, EntityAttribute.ABSTRACT) : neoGraph.createNode(methodName, methodType);
            Node parentClassNode = neoGraph.getOrCreateNode(parentClassName, declaringClass.isInterface() ? EntityType.INTERFACE : EntityType.CLASS);
            Node methodNode = createMethodNode(declaringClass,method);
            neoGraph.linkTwoNodes(parentClassNode, methodNode, RelationType.METHOD);
        }
        return false;
    }

    private Node createMethodNode(ITypeBinding declaringClass, MethodDeclaration method){
        NodeType [] nodeTypeList;
        String methodName = method.getName().getIdentifier();
        EntityVisibility nodeVisibility = Modifier.isPublic(method.getModifiers()) ? EntityVisibility.PUBLIC : EntityVisibility.PRIVATE;
        EntityType methodType = method.isConstructor() ? EntityType.CONSTRUCTOR : EntityType.METHOD;

        if(Modifier.isPublic(declaringClass.getModifiers())){
            if(Modifier.isAbstract(method.getModifiers())){
                nodeTypeList = new NodeType[] {EntityAttribute.ABSTRACT,nodeVisibility};
            }else{
                nodeTypeList = new NodeType[] {nodeVisibility};
            }
        }else{
            if(Modifier.isAbstract(method.getModifiers())){
                nodeTypeList = new NodeType[] {EntityAttribute.ABSTRACT};
            }else{
                nodeTypeList = new NodeType[] {};
            }
        }
        return neoGraph.createNode(methodName, methodType, nodeTypeList);
    }
}

