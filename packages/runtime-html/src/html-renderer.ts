import { InjectArray, InterfaceSymbol, IRegistry, Tracer } from '@aurelia/kernel';
import {
  addBinding,
  Binding,
  BindingMode,
  BindingType,
  ensureExpression,
  IDOM,
  IExpressionParser,
  IInstructionRenderer,
  instructionRenderer,
  InterpolationBinding,
  IObserverLocator,
  IRenderable,
  IRenderContext,
  LifecycleFlags,
  MultiInterpolationBinding
} from '@aurelia/runtime';
import { Listener } from './binding/listener';
import {
  HTMLTargetedInstructionType,
  IListenerBindingInstruction,
  ISetAttributeInstruction,
  IStylePropertyBindingInstruction,
  ITextBindingInstruction
} from './definitions';
import { IEventManager } from './observation/event-manager';

const slice = Array.prototype.slice;

@instructionRenderer(HTMLTargetedInstructionType.textBinding)
/** @internal */
export class TextBindingRenderer implements IInstructionRenderer {
  public static readonly inject: InjectArray = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: ChildNode, instruction: ITextBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('TextBindingRenderer', 'render', slice.call(arguments)); }
    const next = target.nextSibling;
    if (dom.isMarker(target)) {
      dom.remove(target);
    }
    let binding: MultiInterpolationBinding | InterpolationBinding;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    if (expr.isMulti) {
      binding = new MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', BindingMode.toView, context);
    } else {
      binding = new InterpolationBinding(expr.firstExpression, expr, next, 'textContent', BindingMode.toView, this.observerLocator, context, true);
    }
    addBinding(renderable, binding);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(HTMLTargetedInstructionType.listenerBinding)
/** @internal */
export class ListenerBindingRenderer implements IInstructionRenderer {
  public static readonly inject: ReadonlyArray<InterfaceSymbol> = [IExpressionParser, IEventManager];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly eventManager: IEventManager;

  constructor(parser: IExpressionParser, eventManager: IEventManager) {
    this.parser = parser;
    this.eventManager = eventManager;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: HTMLElement, instruction: IListenerBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('ListenerBindingRenderer', 'render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta));
    const binding = new Listener(dom, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
    addBinding(renderable, binding);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(HTMLTargetedInstructionType.setAttribute)
/** @internal */
export class SetAttributeRenderer implements IInstructionRenderer {
  public static readonly register: IRegistry['register'];

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: HTMLElement, instruction: ISetAttributeInstruction): void {
    if (Tracer.enabled) { Tracer.enter('SetAttributeRenderer', 'render', slice.call(arguments)); }
    target.setAttribute(instruction.to, instruction.value);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@instructionRenderer(HTMLTargetedInstructionType.stylePropertyBinding)
/** @internal */
export class StylePropertyBindingRenderer implements IInstructionRenderer {
  public static readonly inject: ReadonlyArray<InterfaceSymbol> = [IExpressionParser, IObserverLocator];
  public static readonly register: IRegistry['register'];

  private readonly parser: IExpressionParser;
  private readonly observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: HTMLElement, instruction: IStylePropertyBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('StylePropertyBindingRenderer', 'render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | BindingMode.toView);
    const binding = new Binding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context);
    addBinding(renderable, binding);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}
