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
			className: 'section section--chronologie',
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
					<PanelBody title="Étapes" initialOpen={ true }>
						<Button
							variant="primary"
							onClick={ addItem }
							style={ { marginBottom: '12px' } }
						>
							Ajouter une étape
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
									Étape { index + 1 }
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
					aria-labelledby="bloc-chronologie-title"
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
								id="bloc-chronologie-title"
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
						<ol className="chronologie__list">
							{ items.map( ( item, index ) => (
								<li
									key={ index }
									className="chronologie__step"
								>
									<RichText
										tagName="h3"
										className="chronologie__step-title heading-sm"
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
										placeholder="Titre…"
									/>
									<span
										className="chronologie__step-marker"
										aria-hidden="true"
									>
										<span className="chronologie__step-number">
											{ index + 1 }
										</span>
									</span>
									<RichText
										tagName="p"
										className="chronologie__step-text body-sm"
										value={ item.text }
										onChange={ ( val ) =>
											updateItem(
												index,
												'text',
												val
											)
										}
										allowedFormats={ [] }
										placeholder="Description…"
									/>
								</li>
							) ) }
						</ol>
					</div>
				</section>
			</>
		);
	},

	save() {
		return null;
	},
} );
