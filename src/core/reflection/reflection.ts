import { Reflector } from './reflector';
import { ReflectionCapabilities } from './reflection_capabilities';

/**
 * The {@link Reflector} used internally in Angular to access metadata
 * about symbols.
 */
export const reflector = new Reflector( new ReflectionCapabilities() );
