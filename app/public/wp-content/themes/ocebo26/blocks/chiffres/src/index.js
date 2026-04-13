import { registerBlockType } from '@wordpress/blocks';
import {
    useBlockProps,
    RichText,
    InspectorControls,
} from '@wordpress/block-editor';
import {
    PanelBody,
    Button,
    SelectControl,
    TextControl,
    __experimentalNumberControl as NumberControl,
} from '@wordpress/components';

import metadata from '../block.json';

registerBlockType( metadata.name, {
    edit( { attributes, setAttributes } ) {
        const blockProps = useBlockProps( {
            className: 'section section--chiffres',
            style: { paddingBlock: 'var(--wp--custom--section-gap)' },
        } );
        const { items } = attributes;

        const updateItem = ( index, key, value ) => {
            const next = items.map( ( item, i ) =>
                i === index ? { ...item, [ key ]: value } : item
            );
            setAttributes( { items: next } );
        };

        const addItem = () => {
            setAttributes( {
                items: [
                    ...items,
                    {
                        number: 0,
                        prefix: '',
                        suffix: '',
                        label: 'Nouveau chiffre',
                        color: 'cyan',
                        size: 'short',
                    },
                ],
            } );
        };

        const removeItem = ( index ) => {
            setAttributes( { items: items.filter( ( _, i ) => i !== index ) } );
        };

        const formatNumber = ( num ) => {
            return new Intl.NumberFormat( 'fr-FR' ).format( num );
        };

        return (
            <>
                <InspectorControls>
                    { items.map( ( item, index ) => (
                        <PanelBody
                            key={ index }
                            title={ `Chiffre ${ index + 1 }` }
                            initialOpen={ false }
                        >
                            <NumberControl
                                label="Nombre"
                                value={ item.number }
                                onChange={ ( val ) =>
                                    updateItem( index, 'number', parseInt( val, 10 ) || 0 )
                                }
                            />
                            <TextControl
                                label="Pr\u00e9fixe"
                                value={ item.prefix }
                                onChange={ ( val ) =>
                                    updateItem( index, 'prefix', val )
                                }
                            />
                            <TextControl
                                label="Suffixe"
                                value={ item.suffix }
                                onChange={ ( val ) =>
                                    updateItem( index, 'suffix', val )
                                }
                            />
                            <SelectControl
                                label="Couleur"
                                value={ item.color }
                                options={ [
                                    { label: 'Cyan', value: 'cyan' },
                                    { label: 'Magenta', value: 'magenta' },
                                ] }
                                onChange={ ( val ) =>
                                    updateItem( index, 'color', val )
                                }
                            />
                            <SelectControl
                                label="Taille"
                                value={ item.size }
                                options={ [
                                    { label: 'Grand (tall)', value: 'tall' },
                                    { label: 'Petit (short)', value: 'short' },
                                ] }
                                onChange={ ( val ) =>
                                    updateItem( index, 'size', val )
                                }
                            />
                            <Button
                                variant="secondary"
                                isDestructive
                                onClick={ () => removeItem( index ) }
                                style={ { marginTop: '8px' } }
                            >
                                Supprimer ce chiffre
                            </Button>
                        </PanelBody>
                    ) ) }
                    <PanelBody>
                        <Button variant="primary" onClick={ addItem }>
                            Ajouter un chiffre
                        </Button>
                    </PanelBody>
                </InspectorControls>

                <section { ...blockProps }>
                    <div className="container container--wide">
                        <h2 className="sr-only">Quelques chiffres</h2>
                        <div className="chiffres__grid">
                            { items.map( ( item, index ) => {
                                const display =
                                    ( item.prefix || '' ) +
                                    formatNumber( item.number || 0 ) +
                                    ( item.suffix || '' );
                                return (
                                    <div
                                        key={ index }
                                        className={ `card-chiffre card-chiffre--${ item.size || 'short' }` }
                                    >
                                        <div className="card-chiffre__inner">
                                            <span
                                                className={ `card-chiffre__number number-xl card-chiffre__number--${ item.color || 'cyan' }` }
                                            >
                                                { display }
                                            </span>
                                            <RichText
                                                tagName="span"
                                                className="card-chiffre__label heading-sm"
                                                value={ item.label || '' }
                                                onChange={ ( val ) =>
                                                    updateItem( index, 'label', val )
                                                }
                                                placeholder="Label..."
                                                allowedFormats={ [ 'core/bold', 'core/italic' ] }
                                            />
                                        </div>
                                    </div>
                                );
                            } ) }
                        </div>
                    </div>
                </section>
            </>
        );
    },

    save() {
        return null;
    },
} );
