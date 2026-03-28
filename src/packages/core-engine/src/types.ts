interface KeyLifeParser{
    name:string
    params:Record<string,unknown>
    parseRule:Function
}

interface KeyEventParser{
    name:string
    params:Record<string,unknown>
    parseRule:Function
}
interface KeyAttrParser{
    name:string
    parseRule:Function
}

interface FunctionBody{
    type:"function"
    // {{{参数名：参数值}}}
    params:string
    //{{body}}
    body:string
}
interface ValueBody{
    type:"string"|"scope"|"props"|"state"|"expression"
    body:string
}
// 单引号包裹的字符串,type为string
const ValueConstraintParser=(value:ValueBody)=>{

}
// {{$_[scope]_变量名}},type为scope
const ValueScopeParser=(value:ValueBody)=>{

}
// {{ref_props_变量名}},type为props
const ValuePropsParser=(value:ValueBody)=>{

}
// {{ref_state_变量名}},type为state
const ValueStateParser=(value:ValueBody)=>{

}
// {{ 表达式}},type为expression
const ValueExpressionParser=(value:ValueBody)=>{

}

// type为function
const ValueFunctionParser=(value:FunctionBody)=>{

}