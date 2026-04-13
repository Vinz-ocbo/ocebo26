import { registerBlockType } from '@wordpress/blocks';
import {
    useBlockProps,
    RichText,
    InspectorControls,
} from '@wordpress/block-editor';
import {
    PanelBody,
    Button,
    TextControl,
} from '@wordpress/components';

import metadata from '../block.json';

registerBlockType( metadata.name, {
    edit( { attributes, setAttributes } ) {
        const blockProps = useBlockProps( {
            className: 'section section--faq',
        } );
        const { sectionNumber, title, items } = attributes;

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
                    { question: 'Nouvelle question', answer: 'R\u00e9ponse...' },
                ],
            } );
        };

        const removeItem = ( index ) => {
            setAttributes( { items: items.filter( ( _, i ) => i !== index ) } );
        };

        return (
            <>
                <InspectorControls>
                    <PanelBody title="R\u00e9glages section">
                        <TextControl
                            label="Num\u00e9ro de section"
                            value={ sectionNumber }
                            onChange={ ( val ) =>
                                setAttributes( { sectionNumber: val } )
                            }
                        />
                    </PanelBody>
                    <PanelBody title="Questions" initialOpen={ false }>
                        { items.map( ( _, index ) => (
                            <div
                                key={ index }
                                style={ {
                                    marginBottom: '12px',
                                    paddingBottom: '12px',
                                    borderBottom: '1px solid #ddd',
                                } }
                            >
                                <strong>Question { index + 1 }</strong>
                                <Button
                                    variant="secondary"
                                    isDestructive
                                    isSmall
                                    onClick={ () => removeItem( index ) }
                                    style={ { marginLeft: '8px' } }
                                >
                                    Supprimer
                                </Button>
                            </div>
                        ) ) }
                        <Button variant="primary" onClick={ addItem }>
                            Ajouter une question
                        </Button>
                    </PanelBody>
                </InspectorControls>

                <section { ...blockProps } aria-labelledby="bloc6-title">
                    <div className="container container--wide">
                        <div className="section-header">
                            <span
                                className="section-number"
                                aria-hidden="true"
                            >
                                { sectionNumber }
                            </span>
                            <RichText
                                tagName="h2"
                                identifier="title"
                                id="bloc6-title"
                                className="display-lg"
                                value={ title }
                                onChange={ ( val ) =>
                                    setAttributes( { title: val } )
                                }
                                placeholder="Titre..."
                                allowedFormats={ [
                                    'core/bold',
                                    'core/italic',
                                    'core/text-color',
                                ] }
                            />
                        </div>
                        <div className="faq__list" role="list">
                            { items.map( ( item, index ) => (
                                <div
                                    key={ index }
                                    className="accordion"
                                    role="listitem"
                                >
                                    <div className="accordion__header">
                                        <RichText
                                            tagName="span"
                                            className="accordion__title heading-sm"
                                            value={ item.question }
                                            onChange={ ( val ) =>
                                                updateItem(
                                                    index,
                                                    'question',
                                                    val
                                                )
                                            }
                                            placeholder="Question..."
                                        />
                                        <span
                                            className="accordion__icon"
                                            aria-hidden="true"
                                        ></span>
                                    </div>
                                    <div className="accordion__body">
                                        <div className="accordion__body-inner">
                                            <RichText
                                                tagName="p"
                                                className="body-md"
                                                value={ item.answer }
                                                onChange={ ( val ) =>
                                                    updateItem(
                                                        index,
                                                        'answer',
                                                        val
                                                    )
                                                }
                                                placeholder="R\u00e9ponse..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) ) }
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
