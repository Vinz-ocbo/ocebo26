import { registerBlockType } from '@wordpress/blocks';
import {
	useBlockProps,
	RichText,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, Button, TextControl } from '@wordpress/components';
import metadata from '../block.json';

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const { sectionNumber, title, items } = attributes;

		const blockProps = useBlockProps( {
			className: 'section section--pourquoi',
		} );

		const updateItem = ( index, field, value ) => {
			const newItems = items.map( ( item, i ) =>
				i === index ? { ...item, [ field ]: value } : item
			);
			setAttributes( { items: newItems } );
		};

		const addItem = () => {
			setAttributes( {
				items: [ ...items, { title: '', text: '' } ],
			} );
		};

		const removeItem = ( index ) => {
			const newItems = items.filter( ( _, i ) => i !== index );
			setAttributes( { items: newItems } );
		};

		return (
			<>
				<InspectorControls>
					<PanelBody title="Réglages section" initialOpen={ false }>
						<TextControl
							label="Numéro de section"
							value={ sectionNumber }
							onChange={ ( val ) =>
								setAttributes( { sectionNumber: val } )
							}
						/>
					</PanelBody>
					<PanelBody title="Items" initialOpen={ true }>
						<Button
							variant="primary"
							onClick={ addItem }
							style={ { marginBottom: '12px' } }
						>
							Ajouter un item
						</Button>
						{ items.map( ( _, index ) => (
							<div
								key={ index }
								style={ {
									display: 'flex',
									alignItems: 'center',
									marginBottom: '4px',
								} }
							>
								<span style={ { flex: 1 } }>
									Item { index + 1 }
								</span>
								<Button
									isDestructive
									variant="tertiary"
									onClick={ () => removeItem( index ) }
								>
									Supprimer
								</Button>
							</div>
						) ) }
					</PanelBody>
				</InspectorControls>

				<section
					{ ...blockProps }
					aria-labelledby="bloc3-title"
				>
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
								id="bloc3-title"
								className="display-lg"
								value={ title }
								onChange={ ( val ) =>
									setAttributes( { title: val } )
								}
								allowedFormats={ [
									'core/bold',
									'core/italic',
								] }
								placeholder="Titre de la section..."
							/>
						</div>
						<div className="pourquoi__list">
							{ items.map( ( item, index ) => (
								<article
									key={ index }
									className="pourquoi__item"
								>
									<RichText
										tagName="h3"
										className="pourquoi__title heading-md"
										value={ item.title }
										onChange={ ( val ) =>
											updateItem(
												index,
												'title',
												val
											)
										}
										allowedFormats={ [
											'core/bold',
											'core/italic',
										] }
										placeholder="Titre..."
									/>
									<span
										className="pourquoi__divider"
										aria-hidden="true"
									></span>
									<RichText
										tagName="p"
										className="pourquoi__text body-md"
										value={ item.text }
										onChange={ ( val ) =>
											updateItem(
												index,
												'text',
												val
											)
										}
										allowedFormats={ [] }
										placeholder="Texte..."
									/>
								</article>
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
