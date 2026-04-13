import { registerBlockType } from '@wordpress/blocks';
import {
	useBlockProps,
	RichText,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, Button, TextControl } from '@wordpress/components';
import metadata from '../block.json';

const CheckSVG = () => (
	<svg
		className="check-list__icon"
		width="22"
		height="16"
		viewBox="0 0 22 16"
		fill="none"
		aria-hidden="true"
	>
		<path
			d="M2 8L8 14L20 2"
			stroke="#d74ed7"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const { sectionNumber, title, items } = attributes;

		const blockProps = useBlockProps( {
			className: 'section section--liste',
		} );

		const updateItem = ( index, value ) => {
			const newItems = [ ...items ];
			newItems[ index ] = value;
			setAttributes( { items: newItems } );
		};

		const addItem = () => {
			setAttributes( { items: [ ...items, '' ] } );
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
						<p>{ items.length } item(s)</p>
						<Button
							variant="primary"
							onClick={ addItem }
							style={ { marginBottom: '8px' } }
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
					aria-labelledby="bloc1-title"
				>
					<div className="container">
						<div className="bloc-liste">
							<div className="bloc-liste__header">
								<div className="section-header">
									<span
										className="section-number"
										aria-hidden="true"
									>
										{ sectionNumber }
									</span>
									<RichText
										tagName="h2"
										id="bloc1-title"
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
							</div>
							<div className="bloc-liste__body">
								<ul className="check-list">
									{ items.map( ( item, index ) => (
										<li
											key={ index }
											className="check-list__item"
										>
											<CheckSVG />
											<RichText
												tagName="span"
												value={ item }
												onChange={ ( val ) =>
													updateItem( index, val )
												}
												allowedFormats={ [] }
												placeholder="Texte de l'item..."
											/>
											{ index < items.length - 1 && (
												<hr
													className="check-list__separator"
													aria-hidden="true"
												/>
											) }
										</li>
									) ) }
								</ul>
							</div>
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
