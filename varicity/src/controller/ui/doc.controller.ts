// @ts-ignore
import Factory from "../../../public/images/Factory.png"
// @ts-ignore
import Strategy from "../../../public/images/Strategy.png"
// @ts-ignore
import Template from "../../../public/images/Template.png"
// @ts-ignore
import Decorator from "../../../public/images/Decorator.png"

export class DocController {
    public static buildDoc() {
        (document.getElementById("factory_img") as HTMLImageElement).src = Factory;
        (document.getElementById("strategy_img") as HTMLImageElement).src = Strategy;
        (document.getElementById("template_img") as HTMLImageElement).src = Template;
        (document.getElementById("decorator_img") as HTMLImageElement).src = Decorator;

        document.getElementById("doc_content").style.display = "none";

        document.getElementById("documentation").onclick = (me) => {
            if (me.target == document.getElementById("documentation")) {
                const content = document.getElementById("doc_content");
                if (content.style.display == "block") content.style.display = "none";
                else content.style.display = "block";
            }
        }
    }
}