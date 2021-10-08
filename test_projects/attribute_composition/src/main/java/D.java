public class D {

    private B b ;
    private C c ;

    public D (){

    }

    public void dclass (A a, B b){
        System.out.println("je suis dans D");
    }

    public A printA (){
        System.out.println("je retourne A");
        return new A();
    }
}